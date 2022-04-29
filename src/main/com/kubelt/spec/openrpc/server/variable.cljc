(ns com.kubelt.spec.openrpc.server.variable
  "A schema for an OpenRPC Server Variable object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})


(def default
  :string)

(def description
  :string)

(def enum
  [:vector :string])

;; Server Variable
;; -----------------------------------------------------------------------------

(def variable
  [:map
   {:closed true
    :description "An object representing a Server Variable for server
URL template substitution."}

   [:default
    {:description "The default value to use for the substitution, which
SHALL be sent if an alternate value is *not* supplied. Note that this
behaviour is different than the Schema Object's treatment of default
values, because in those cases parameter values are optional."}
    default]

   [:description
    {:optional true
     :description "An optional description for the server variable."}
    description]

   [:enum
    {:optional true
     :description "An enumeration of string values to be used if the
substitution options are from a limited set."}
    enum]])

;; [Server Variable]
;; -----------------------------------------------------------------------------

(def variables
  [:map-of :string variable])
