(ns com.kubelt.spec.openrpc.external
  "A schema for the OpenRPC External Documentation object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})


(def url
  :string)

(def description
  :string)

;; External Docs
;; -----------------------------------------------------------------------------

(def docs
  [:map
   {:closed true
    :description "Allows referencing an external resource for extended
documentation."}

   [:url
    {:description "The URL for the target documentation. Value MUST be
in the format of a URL."}
    url]

   [:description
    {:description "A verbose explanation of the target documentation."}
    description]])
