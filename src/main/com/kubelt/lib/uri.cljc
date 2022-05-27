(ns com.kubelt.lib.uri
  "URI-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [camel-snake-kebab.core :as csk]
   [lambdaisland.uri :as lambda])
  (:require
   [com.kubelt.lib.error :as lib.error]))

;; TODO test test test

;; TODO define com.kubelt.spec.uri schema

(def spec-parse-url
  :string)

(def spec-parse-opts
  [:map
   [:query/convert? {:optional true} :boolean]
   [:query/keywordize? {:optional true} :boolean]
   [:query/hyphenate? {:optional true} :boolean]])

(def parse-defaults
  {:query/convert? true
   :query/keywordize? true
   :query/hyphenate? true})

(defn- query-string->map
  "Convert a query string into a map."
  [query-str {:keys [query/keywordize? query/hyphenate?]}]
  {:pre [(string? query-str)]}
  (into {}
        (map (fn [s]
               (let [[k v] (cstr/split s #"=")
                     k (cond-> k
                         ;; convert string keys to keywords
                         keywordize?
                         keyword
                         ;; convert keys to kebab case
                         hyphenate?
                         csk/->kebab-case)]
                 [k v]))
             (cstr/split query-str #"&"))))

(defn query-map->str
  "Convert a query map into a string. If given a string, the string is
  returned unchanged."
  [m]
  {:pre [(map? m)]}
  (let [parts (map (fn [[k v]]
                    (let [k (name k)]
                      (str k "=" v)))
                   m)]
    (cstr/join "&" parts)))

(defn- parse-query
  "Given a query string, process it according to the configured
  options. With an empty options map, the same query string is
  returned."
  [query-str {:keys [query/convert?] :as options}]
  {:pre [(string? query-str)]}
  (if convert?
    (query-string->map query-str options)
    query-str))

;; parse
;; -----------------------------------------------------------------------------

(defn parse
  "Given a URL string, parse the URL into component parts and return as a
  map. Available options include:
  - :query/convert?, convert query string into a map (default: true)
  - :query/keywordize?, convert query map keys to keywords (default: true)
  - :query/hyphenate?, convert query map keys to kebab case (default: true)"
  ([s]
   (parse s parse-defaults))

  ([s options]
   (lib.error/conform*
    [spec-parse-url s]
    [spec-parse-opts options]
    (let [options (merge parse-defaults options)
          uri (lambda/uri s)]
      (merge {:com.kubelt/type :kubelt.type/uri}
             ;; :uri/scheme
             (when-let [scheme (:scheme uri)]
               (let [scheme (keyword scheme)]
                 {:uri/scheme scheme}))
             ;; :uri/domain
             (when-let [domain (:host uri)]
               {:uri/domain domain})
             ;; :uri/port
             (when-let [port (:port uri)]
               {:uri/port port})
             ;; :uri/path
             (when-let [path (:path uri)]
               {:uri/path path})
             ;; :uri/fragment
             (when-let [fragment (:fragment uri)]
               {:uri/fragment fragment})
             ;; :uri/query
             (when-let [query (:query uri)]
               (let [query (parse-query query options)]
                 {:uri/query query}))
             ;; :uri/username
             (when-let [user (:user uri)]
               {:uri/username user})
             ;; :uri/password
             (when-let [password (:password uri)]
               {:uri/password password}))))))

;; unparse
;; -----------------------------------------------------------------------------

(defn unparse
  "Convert a URI map into a URI string."
  [m]
  (let [scheme (name (get m :uri/scheme))
        user (get m :uri/username)
        password (get m :uri/password)
        host (get m :uri/domain)
        port (get m :uri/port)
        path (get m :uri/path)
        fragment (get m :uri/fragment)
        query (let [x (get m :uri/query)]
                (if (map? x)
                  (query-map->str x)
                  x))
        m {:scheme scheme
           :user user
           :password password
           :host host
           :port port
           :path path
           :query query
           :fragment fragment}]
    (str (merge (lambda/uri "") m))))

;; expand
;; -----------------------------------------------------------------------------
;; TODO convert a URL template string and associated parameter values
;; into a URI string.

(defn expand
  "Given a URL template and a map of parameter values, return the expanded
  URI. If no variables are supplied, the template is returned unchanged."
  [tpl variables]
  {:pre [(string? tpl) ((some-fn [nil? map?]) variables)]}
  ;; TODO actually expand this template
  tpl)
