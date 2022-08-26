(ns com.kubelt.spec.provider
  "Blockchain-related provider schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; blockchain
;; -----------------------------------------------------------------------------

(def blockchain
  [:enum "ethereum"])

;; network
;; -----------------------------------------------------------------------------
;; This is based on the result of the RPC provider getNetwork() result.

(def network
  [:map
   [:network/blockchain blockchain]
   [:network/chain :string]
   [:network/chain-id :int]])

(def network-schema
  [:and
   {:name "Network"
    :description "A provider network specifies a specific blockchain and
    network (test, main) variant."
    :example {:network/blockchain "ethereum"
              :network/chain "goerli"
              :network/chain-id 5}}
   network])
