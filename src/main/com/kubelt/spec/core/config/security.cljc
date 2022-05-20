(ns com.kubelt.spec.core.config.security
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

(def ttl :int)

(def jwt
  [:map
   [:ttl ttl]])

(def nonce
  [:map
   [:ttl ttl]])

(def auth
  [:map
   [:jwt jwt]
   [:nonce nonce]])

(def role
  [:map
   [:role-id :string]])

(def signer
  [:map
   [:user-id :string]
   [:key :string]
   [:roles [:vector role]]])

(def signers [:vector signer])

(def roles
  [:vector
   (conj role
         [:policies [:vector :string]])])

(def caveat
  [:map
   [:type :string]
   [:value [:vector :string]]])

(def capability
  [:map
   [:capability-id :string]
   [:caveats [:vector caveat]]])

(def policy
  [:map
   [:policy-id :string]
   [:capabilities [:vector capability]]])

(def policies
  [:vector policy])

(def capabilities
  [:vector capability])
