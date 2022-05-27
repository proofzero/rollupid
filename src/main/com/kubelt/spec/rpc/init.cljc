(ns com.kubelt.spec.rpc.init
  "Schemas related to RPC client (init) function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.jwt :as spec.jwt]
   [com.kubelt.spec.rpc.init :as spec.rpc.init]))

;; http-client
;; -----------------------------------------------------------------------------

;; TODO re-use existing HTTP client definition
(def http-client
  :map)

;; jwt
;; -----------------------------------------------------------------------------
;; Defines a JWT credential supplied along with an RPC request.

;; TODO flip :rpc/jwt to spec.jwt/jwt once we use/expect decrypted jwt
;; value (in BE too).
(def jwt
  ;;spec.jwt/jwt
  :string)

;; user-agent
;; -----------------------------------------------------------------------------
;; Override the default HTTP user agent string. Useful for development
;; and debugging to find the calls that originated with a specific
;; instance of the client.

(def user-agent
  :string)

;; timeout
;; -----------------------------------------------------------------------------
;; The amount of time to wait for an RPC request to complete.

(def timeout
  nat-int?)

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to RPC client (init) function.

(def options
  [:map
   [:http/client {:optional true} http-client]
   [:http/user-agent {:optional true} user-agent]
   [:rpc/jwt {:optional true} jwt]
   [:rpc/timeout {:optional true} timeout]])
