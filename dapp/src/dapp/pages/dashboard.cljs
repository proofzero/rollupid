(ns dapp.pages.dashboard
  (:require
   [com.kubelt.lib.promise :refer [promise]]
   [com.kubelt.lib.crypto.hexify :as hexify]
   [dapp.components.button :as button]
   [dapp.components.header :as header]
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
                 ;; dispatch the provider
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
                  (log/error {:msg "web3 modal error" :error error}))))))

(defn connect-wallet
  []
  (fn []
    [:div.connect-wallet
     {:class "flex flex-col mt-36 content-center text-center"}
     [:img
      {:class "h-8"
       :src "images/wallet.svg"}]
     [:p
      {:class "text-gray-900 text-sm mt-4"}
      "Connect a Wallet"]
     [:p
      {:class "text-gray-500 text-sm my-1"}
      "Get started by connecting your wallet."]
     [button/render {:class "self-center mt-6"
                     :text "Connect a Wallet"
                     :on-click (fn [e]
                                 (.preventDefault e)
                                 (open-modal))
                     :variant :primary}]]))

(defn dashboard-content
  []
  [:div.dashboard-content
   {:class "bg-gray-200 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Dashboard"]
   ;; TODO: When wallet is disconnected or not logged in, show the `connect-wallet` component.
   ;; Wallet connected views to be worked on shortly.
   [connect-wallet]])

(defn render
  []
  (fn []
    [:div.dashboard-container
     {:class "w-4/5 flex flex-col"}
     [header/render]
     [dashboard-content]]))
