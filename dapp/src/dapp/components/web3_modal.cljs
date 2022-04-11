(ns dapp.components.web3-modal
  (:require
   [com.kubelt.lib.promise :refer [promise]]
   [com.kubelt.lib.crypto.hexify :as hexify]
   [dapp.wallet :as wallet]
   [ethers :as ethers]
   [re-frame.core :as re-frame]
   [taoensso.timbre :as log])
  (:require
   ["web3modal$default" :as Web3Modal]
   ["@coinbase/wallet-sdk" :as CoinbaseWalletSDK]))

(def provider-options
  {:network "mainnet"
   :cacheProvider true
   :theme "dark"
   :providerOptions {:walletlink {:package CoinbaseWalletSDK :options {:appName "Kubelt"}}}})

(defn make-sign-fn
  [provider wallet-address]
  (fn [signable]
    (promise
     (fn [resolve _reject]
       (let [signable-buffer (hexify/hex-string signable)]
         (-> (.request provider (clj->js {:method "personal_sign"
                                          :params [signable-buffer wallet-address]}))
             (.then (fn [digest]
                      (resolve digest)))))))))

(defn open-modal []
  (log/trace "open the modal")
  (let [modal (Web3Modal. (clj->js provider-options))]
    ;(.clearCachedProvider modal)
    (-> (.connect modal)
        ;; TODO: figure out why this won't re-prompt wallet if password was not entered at prompt
        (.then (fn [provider]
                 (log/debug {:provider provider})
                 (-> (.request provider (clj->js {:method "eth_requestAccounts"}))
                     (.then (fn [account]
                              (let [raw-address (first (js->clj account))
                                    wallet-address (ethers/utils.getAddress raw-address)
                                    sign-fn (make-sign-fn provider wallet-address)
                                    new-wallet {:com.kubelt/type :kubelt.type/wallet
                                                :wallet/address wallet-address
                                                :wallet/sign-fn sign-fn}]
                                (re-frame/dispatch [::wallet/set-current-wallet new-wallet])))))))
        (.catch (fn [error]
                  (.clearCachedProvider modal)
                  (log/error error))))))
