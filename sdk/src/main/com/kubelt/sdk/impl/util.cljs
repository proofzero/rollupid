(ns com.kubelt.sdk.impl.util
  "Miscellaneous utilities."
  (:require
   ["os" :as os]
   ["process" :as process])
  (:require
   [goog.object]
   [goog.userAgent])
  (:require
   [clojure.string :as str]))


(defn- obj->clj
  "Turn a JavaScript object into a Clojure map."
  [obj]
  (-> (fn [result key]
        (let [v (goog.object/get obj key)]
          (if (= "function" (goog/typeOf v))
            result
            (assoc result key v))))
      (reduce {} (.getKeys goog/object obj))))

;; Public
;; -----------------------------------------------------------------------------

(defn environment
  "Return a map of the process environment. In the returned map
  environment variable names and values are the map keys and values."
  []
  (obj->clj (.-env process)))

(defn node-env
  "Return a map describing the node environment, including details such as
  the user's home directory, temp directory, username, and a map of
  environment variables."
  []
  (let [home-dir (.homedir os)
        tmp-dir (.tmpdir os)
        username (.-username (.userInfo os))
        env-map (environment)]
    {:home-dir home-dir
     :tmp-dir tmp-dir
     :environment env-map
     :username username}))

;; TODO test me
(defn browser?
  "Return true if this is a browser-based execution environment, false
  otherwise."
  []
  ;; User agent string is not empty when running in browser.
  (not (str/blank? (.getUserAgentString goog.userAgent))))

;; TODO test me
(defn node?
  "Return true if this is a node-based execution environment, false
  otherwise."
  []
  ;; User agent string is empty when not running in browser.
  (str/blank? (.getUserAgentString goog.userAgent)))

;; TODO test me
(defn platform
  "Return a keyword representing the current platform (which is either
  node or browser)."
  []
  (cond
    (browser?) :platform.type/browser
    true :platform.type/node))
