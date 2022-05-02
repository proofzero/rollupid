(ns com.kubelt.lib.util
  "Miscellaneous utilities."
  #?(:node
     (:require
      ["os" :as os]
      ["process" :as process]))
  (:require
   [goog.object]
   [goog.userAgent])
  (:require
   [clojure.string :as str]))

;; Public
;; -----------------------------------------------------------------------------

(defn obj->clj
  "Turn a JavaScript object into a Clojure map."
  [obj]
  (-> (fn [result key]
        (let [v (goog.object/get obj key)]
          (if (= "function" (goog/typeOf v))
            result
            (assoc result key v))))
      (reduce {} (goog.object/getKeys obj))))

#?(:node
   (defn environment
     "Return a map of the process environment. In the returned map
  environment variable names and values are the map keys and values."
     []
     (obj->clj (.-env process))))

#?(:node
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
        :username username})))
