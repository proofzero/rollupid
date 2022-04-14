(ns dapp.components.header
  (:require
   [re-frame.core :as re-frame]))

(defn render
  [_]
  (let [wallet (re-frame/subscribe [:dapp.wallet/wallet])]
    (fn [logged-in?]
      (let [address (:wallet/address @wallet)]
        [:div.header
         {:class "flex items-center justify-end bg-white h-16 drop-shadow"}
         (when logged-in?
           [:div.login-metadata
            {:class "flex flex-row items-center justify-end ml-2 mr-4"}
            [:div.address-info
             {:class "flex flex-col items-end mr-4"}
             [:p
              {:class "text-xs text-gray-500"}
              (str (subs address 0 10) "..." (subs address 32))]
             [:a
              {:on-click (fn [e]
                           ;; TODO: when clicked, kill session and disconnect wallet
                           (.preventDefault e))
               :class "text-xs hover:underline"}
              "Disconnect"]]
            [:img
             {:class "h-8"
              ;; TODO: Lookup wallet avatar
              :src "images/default-avatar.svg"}]])]))))
