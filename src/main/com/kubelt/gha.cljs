(ns com.kubelt.gha
  "Entry point for GitHub Action."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]])
  (:require
   ["@actions/core" :as core])
  (:require
   [com.kubelt.gha.util :as gha.util]))

(defn run
  []
  (try
    (let [ms (.getInput core "milliseconds")
          message (str "Waiting " ms " milliseconds…")]
      (.info core message)

      ;; NB: debug is only output if you set the secret ACTIONS_RUNNER_DEBUG to true
      (.debug core (.toTimeString (js/Date.)))
      (let [milliseconds (js/parseInt ms)]
        (<p! (gha.util/wait milliseconds)))

      (.setOutput core "time" (.toTimeString (js/Date.))))
    (catch js/Exception e
      (.setFailed core (.-message e)))))

(go (run))
