(ns kubelt.worker.core
  "Kubelt web worker implementation. Responsible for content state
  and metrics as well as running user-supplied queries."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

(defn init []
  (js/self.addEventListener "message"
   (fn [^js e]
     (js/postMessage (.. e -data)))))
