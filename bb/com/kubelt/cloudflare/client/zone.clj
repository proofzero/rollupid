(ns com.kubelt.cloudflare.client.zone
  "Client methods for Cloudflare Zone API."
  (:require
   [clojure.pprint :as pprint])
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
