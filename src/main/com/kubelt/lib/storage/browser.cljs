(ns com.kubelt.lib.storage.browser
  "Support for HTTP requests from a browser execution context."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.json :as lib.json]))

(def ^:dynamic session-storage? false)

(defn- get-storage
  []
  (if session-storage?
    (.-sessionStorage js/window)
    (.-localStorage js/window)))

(defn- set-item!
  "Set `key' in browser's localStorage to `val`."
  [key val]
  (.setItem (get-storage) key val))

(defn- get-item
  "Returns value of `key' from browser's localStorage."
  [key]
  (.getItem (get-storage) key))

(defn- remove-item!
  "Remove the browser's localStorage value for the given `key`"
  [key]
  (.removeItem (get-storage) key))

(def ^:private DB_ID_KEY "com.kubelt.lib.storage.browser.db")

(defn- store-fn
  "Return a function that stores SDK state (supplied as a map) into a
  browser local storage location/key. This function returns a promise that
  resolves to map describing what was written:
  - :data, the map of data that was written"
  [m]
  {:pre [(map? m)] :post [(lib.promise/promise? %)]}
  (lib.promise/promise
   (fn [resolve _]
     (let [data (lib.json/edn->json-str m)]
       (set-item! DB_ID_KEY data)
       (resolve {:data data})))))

(defn- restore-fn
  "Return a function that loads SDK state from a browser local storage
  location/key and returns it as a map."
  []
  {:post [(lib.promise/promise? %)]}
  (lib.promise/promise
   (fn [resolve _]
     (let [data (-> (get-item DB_ID_KEY)
                    (lib.json/json-str->edn))]
       (resolve {:data data})))))

(defn create
  "Create a configuration storage capability."
  [app-name]
  (tap> [::create app-name :session-storage? session-storage?])
  {:com.kubelt/type :kubelt.type/storage
   :storage/store-fn store-fn
   :storage/restore-fn restore-fn})
