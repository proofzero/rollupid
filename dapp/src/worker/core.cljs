(ns worker.core
  "Web worker example."
  {:author "Kubelt Inc." :copyright 2021 :license "UNLICENSED"})

(defn message-listener
  [^js e]
  (js/postMessage (.. e -data)))

(defn init []
  (js/self.addEventListener "message" message-listener))
