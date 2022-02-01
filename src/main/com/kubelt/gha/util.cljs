(ns com.kubelt.gha.util
  "GitHub Action-related utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})


(defn wait
  "Return a promise that resolves after the given duration in milliseconds
  has elapsed."
  [milliseconds]
  (js/Promise.
   (fn [resolve]
     (if-not (number? milliseconds)
       (throw (ex-info "milliseconds not a number"
                       {:milliseconds milliseconds}))
       (js/setTimeout (fn [] (resolve "done!")) milliseconds)))))
