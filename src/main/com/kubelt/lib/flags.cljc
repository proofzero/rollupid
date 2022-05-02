(ns com.kubelt.lib.flags)

(def ipfs :ipfs)

(defn ipfs?
  [flags]
  (get flags ipfs false))

(defn ipfs!
  [flags b]
  (assoc flags ipfs b))
