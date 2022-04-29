(ns com.kubelt.spec.openrpc.error
  "A schema for an OpenRPC Error object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.openrpc.reference :as openrpc.reference]))


(def code
  :int)

(def message
  :string)

(def data
  :any)

;; Error
;; -----------------------------------------------------------------------------

(def error
  [:map
   {:closed true
    :description "Defines an application level error."}

   [:code
    {:description "A Number that indicates the error type that
occurred. This MUST be an integer. The error codes from and including
-32768 to -32000 are reserved for pre-defined errors. These pre-defined
errors SHOULD be assumed to be returned from any JSON-RPC API."}
    code]

   [:message
    {:description "A short description of the error. The message SHOULD
be limited to a concise single sentence."}
    message]

   [:data
    {:optional true
     :description "A primitive or structured value that contains
additional information about the error. This may be omitted. The value
of this member is defined by the server, e.g. detailed error
information, nested errors, etc."}
    data]])

;; [Error]
;; -----------------------------------------------------------------------------

(def errors
  [:vector [:or openrpc.reference/reference error]])
