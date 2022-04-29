(ns com.kubelt.spec.openrpc.runtime
  "A schema for an OpenRPC Runtime Expression object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; Runtime Expression
;; -----------------------------------------------------------------------------

(def expression
  [:and
   {:description "Runtime expressions allow the user to define an
expression which will evaluate to a string once the desired value(s) are
known. The are used when the desired value of a link or server can only
be constructed at run time. This mechanism is used by Link objects and
Server Variables."}
   :string])
