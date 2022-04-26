(ns com.kubelt.ddt.cmds.storage.store
  "Store SDK state into platform-specific storage location."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.storage :as lib.storage]
   [com.kubelt.sdk.v1 :as sdk]))

(defn report-err
  [e]
  (let [msg (:error (if-not (lib.error/error? e)
                      (lib.error/from-obj e)
                      e))]
    (println "error:" msg)))

(defn auth-fn
  [kbt]
  (-> (sdk/store& kbt)
      (lib.promise/then
       (fn [{:keys [path data]}]
         (println "stored" path)
         (prn data)))
      (lib.promise/catch report-err)))

(defonce command
  {:command "store"
   :desc "Store SDK state"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (let [password (.-password result)]
                     ;; The (authenticate) fn instantiates default
                     ;; storage and passed to (sdk/init):
                     ;; (sdk/init {:config/storage storage})
                     (ddt.auth/authenticate args-map password auth-fn))))))})
