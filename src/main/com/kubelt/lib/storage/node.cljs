(ns com.kubelt.lib.storage.node
  "Support for SDK state storage in a Node.js execution context."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
   ["path" :as path])
  (:require
   [clojure.string :as cstr])
  (:require
   [cognitect.transit :as t]
   [malli.core :as malli]
   [malli.error :as me]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.io.node :as lib.io]
   [com.kubelt.lib.path :as lib.path]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.spec.storage :as spec.storage]))

(defn- make-store-fn
  "Return a function that stores SDK state (supplied as a map) into a
  node-specific storage location. This function returns a promise that
  resolves to map describing what was written:
  - :path, the path to the file that was written
  - :data, the map of data that was written
  - :mode, the mode of the file that was written

  The path to the backing file used to store the state must be passed as
  the path argument."
  [path*]
  (let [w (t/writer :json)]
    (fn [m]
      {:pre [(map? m)] :post [(lib.promise/promise? %)]}
      (let [data (t/write w m)
            mode 0640
            opts #js {:mode mode}]
        (->
         (lib.io/ensure-kubelt-dir& path* "localstorage")
         (lib.promise/then #(.writeFile fs-promises (.join path % "storage.json") data opts))
         (lib.promise/then
          (fn []
            {:path (lib.io/kubelt-dir path* "localstorage")
             :mode mode
             :data m})))))))

(defn- make-restore-fn
  "Return a function that loads SDK state from a node-specific storage
  location and returns it as a map. The path to the backing file where
  the state is stored is passed as the path argument."
  [path*]
  (let [r (t/reader :json)]
    (fn []
      {:post [(lib.promise/promise? %)]}
      (let [opts #js{:encoding "utf8"}]
        (->
         (lib.io/ensure-kubelt-dir& path* "localstorage")
         (lib.promise/then #(.readFile fs-promises (.join path % "storage.json") opts))
         (lib.promise/then
          (fn [data-str]
            (let [data (t/read r data-str)]
              data))))))))

(defn- make-path
  "Return the path to the file where state is stored."
  [app-name]
  (let [data-path (lib.path/data app-name)]
    (cstr/join "/" [data-path])))

;; Public
;; -----------------------------------------------------------------------------

(defn create
  "Create a configuration storage capability."
  [app-name]
  (let [path (make-path app-name)
        store-fn (make-store-fn path)
        restore-fn (make-restore-fn path)]
    (tap> [::create app-name])
    {:com.kubelt/type :kubelt.type/storage
     :storage/path path
     :storage/store-fn store-fn
     :storage/restore-fn restore-fn}))
