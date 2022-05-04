(ns com.kubelt.lib.wallet.shared
  (:require
   [goog.object :as gobj]
   [com.kubelt.lib.octet :as lib.octet]
   [com.kubelt.lib.promise :as lib.promise])
  (:require
   ["@ethersproject/keccak256" :refer [keccak256]]
   ["@ethersproject/signing-key" :refer [SigningKey]]
   ["@ethersproject/wallet" :refer [Wallet]]))

(defn make-sign-fn
  "Given an Ethereum wallet, return a signing function that uses the
  wallet's private key to sign the digest of some given data. To match
  what happens in the browser, the signing function returns a promise
  that resolves to the signature value."
  [eth-wallet]
  (fn [data]
    (lib.promise/promise
     (fn [resolve _reject]
       (let [private-key (.-privateKey eth-wallet)
             signing-key (SigningKey. private-key)

             data-length (count data)
             prefix (str "\u0019Ethereum Signed Message:\n" data-length)
             prefix+data (str prefix data)
             data-bytes (lib.octet/as-bytes prefix+data)

             digest (keccak256 data-bytes)
             signature-raw (.signDigest signing-key digest private-key)
             signature (gobj/get signature-raw "compact")]
         (resolve signature))))))

(defn random-wallet
  []
  (lib.promise/promise
   (fn [resolve _reject]
     (let [eth-wallet (.createRandom Wallet)
           sign-fn (make-sign-fn eth-wallet)]
       (resolve
        (.then (.getAddress eth-wallet)
               (fn [address]
                 {:com.kubelt/type :kubelt.type/wallet
                  :wallet/address address
                  :wallet/sign-fn sign-fn})))))))
