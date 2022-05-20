(ns com.kubelt.spec.rpc.github
  "Schemas relating to com.kubelt.rpc.schemas/github function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; repo
;; -----------------------------------------------------------------------------
;; The coordinates of a GitHub repository.

(def repo
  [:map {:closed true}
   [:github/org :string]
   [:github/repo :string]])

;; options
;; -----------------------------------------------------------------------------

(def options
  :map)
