(ns com.kubelt.spec.storage
  "Schema for configuration storage."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})


(def store-fn
  [:=> {:description "A storage function that takes a map of SDK state
and writes it to platform storage. Returns an error map on error."}
   ;; TODO return error map and the stored value on success?
   [:cat :any] [:or :string :map]])

(def restore-fn
  [:=> {:description "A storage function that returns an SDK instance
using state loaded from platform storage, or an error map if an error
occurs."}
   ;; TODO returns a system map (use more precise spec once available)
   [:cat :any] :map])

(def storage
  [:and {:description "A wrapper around platform storage for storing
   some SDK configuration state. Note that we use an & suffix to denote
   a function that returns a delayed computation (future, promise)."}
   [:map
    [:com.kubelt/type [:enum :kubelt.type/storage]]
    [:storage/store-fn store-fn]
    [:storage/restore-fn restore-fn]]])
