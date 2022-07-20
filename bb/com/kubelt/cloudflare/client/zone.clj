(ns com.kubelt.cloudflare.client.zone
  "Client methods for Cloudflare Zone API."
  (:require
   [clojure.pprint :as pprint]
   [clojure.string :as cstr])
  (:require
   [cheshire.core :as json]
   [org.httpkit.client :as http]
   [selmer.parser :as tpl]))

;; purge-cache
;; -----------------------------------------------------------------------------
;; Example response:
;; {
;;   "success": true,
;;   "errors": [],
;;   "messages": [],
;;   "result": {
;;     "id": "9a7806061c88ada191ed06f989cc3dac"
;;   }
;; }

(defn purge-cache
  "Purge all cached files for a zone."
  [client zone-id]
  {:pre []}
  (let [method :post
        path (tpl/render "zones/{{zone-id|urlescape}}/purge_cache" {:zone-id zone-id})
        params {:purge_everything true}
        token (get client :cloudflare.api/token)
        authentication (tpl/render "Bearer {{token}}" {:token token})
        headers {"Authorization" authentication
                 "Content-Type" "application/json"}
        body (json/generate-string params)
        base-url (get client :cloudflare.api/url)
        url (str base-url path)
        timeout (get client :cloudflare.api/timeout)
        request {:method method
                 :url url
                 :headers headers
                 :body body
                 :timeout timeout}]
    (deref (http/request request))))

;; purge-url
;; -----------------------------------------------------------------------------
;; NB: in free tier this call is limited to a rate of 1000 URLs purged
;; per hour.
;;
;; Example "files" specification:
;; [
;;   "http://www.example.com/css/styles.css",
;;   {
;;     "url": "http://www.example.com/cat_picture.jpg",
;;     "headers": {
;;       "Origin": "https://www.cloudflare.com",
;;       "CF-IPCountry": "US",
;;       "CF-Device-Type": "desktop"
;;     }
;;   }
;; ]

;; A single call may purge at most 30 URLs.
(def ^:private max-urls 30)

(defn purge-url
  "Granularly remove one or more files from Cloudflare's cache either by
  specifying URLs."
  [client zone-id files]
  {:pre []}
  (if (> (count files) max-urls)
    (let [message (cstr/join " " ["no more than" max-urls "URLs allowed"])]
      (throw (ex-info message {:max-urls max-urls})))
    (let [method :post
          path (tpl/render "zones/{{zone-id|urlescape}}/purge_cache" {:zone-id zone-id})
          token (get client :cloudflare.api/token)
          authentication (tpl/render "Bearer {{token}}" {:token token})
          headers {"Authorization" authentication
                   "Content-Type" "application/json"}
          body (json/generate-string {:files files})
          base-url (get client :cloudflare.api/url)
          url (str base-url path)
          timeout (get client :cloudflare.api/timeout)
          request {:method method
                   :url url
                   :headers headers
                   :body body
                   :timeout timeout}]
      (deref (http/request request)))))

;; purge-other
;; -----------------------------------------------------------------------------
;; NB: this call is only available for *enterprise* zones.

(defn purge-other
  "Granularly remove one or more files from Cloudflare's cache either by
  specifying host(s), the cache-tag(s), or prefix(es). Each of the
  following optional parameter may be supplied with a vector of string
  values:
  - :tags, a vector of Cache-Tag header values (e.g. [\"some-tag\"])
  - :hosts, a vector of hosts (e.g. [\"www.example.com\"])
  - :prefixes, a vector of URL prefixes (e.g. [\"www.example.com/foo\"]"
  [client zone-id & params]
  (let [params (as-> params $
                 (apply hash-map $)
                 (select-keys $ [:tags :hosts :prefixes]))]
    (if (empty? params)
      (throw (ex-info "missing params" {:allowed [:tags :hosts :prefixes]}))
      (let [method :post
        path (tpl/render "zones/{{zone-id|urlescape}}/purge_cache" {:zone-id zone-id})
        token (get client :cloudflare.api/token)
        authentication (tpl/render "Bearer {{token}}" {:token token})
        headers {"Authorization" authentication
                 "Content-Type" "application/json"}
        body (when (some? params) (json/generate-string params))
        base-url (get client :cloudflare.api/url)
        url (str base-url path)
        timeout (get client :cloudflare.api/timeout)
        request {:method method
                 :url url
                 :headers headers
                 :body body
                 :timeout timeout}]
        (deref (http/request request))))))
