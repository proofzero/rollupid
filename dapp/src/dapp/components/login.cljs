(ns dapp.components.login
  (:require
    [re-frame.core :as re-frame]
    [reitit.frontend.easy :as rfe]
    [dapp.wallet :as wallet]
    )
  (:require [reagent.core  :as reagent]                   
	    [re-frame.core :refer [subscribe dispatch]]   
	    [clojure.string :as str])                    


  (:require
    ["web3modal$default" :as Web3Modal]
    ["@coinbase/wallet-sdk" :as CoinbaseWalletSDK]))


(def provider-options
  {:network "mainnet"
   :cacheProvider true
   :theme "dark"
   :providerOptions {:walletlink {:package CoinbaseWalletSDK :options {:appName "Kubelt"}}}})

(defn open-modal []
  (prn "open the modal")

  (let [modal (Web3Modal. (clj->js provider-options))]
    ;(.clearCachedProvider modal)
    (-> (.connect modal)
	;; TODO: figure out why this won't re-prompt wallet if password was not entered at prompt
	(.then (fn [provider]
		 ;; dispatch the provider
		 (prn "provider")
		 #(re-frame/dispatch [::wallet/web3-modal provider])))
	(.catch (fn [error]
		  (.clearCachedProvider modal)
		  (js/console.log error))))))

(defn todo-input [{:keys [title on-save on-stop]}]                           
  (let [val  (reagent/atom title)                                            
	stop #(do (reset! val "")                                            
		  (when on-stop (on-stop)))                                  
	save #(let [v (-> @val str str/trim)]                                
		(on-save v)                                                  
		(stop))]                                                     
    (fn [props]                                                              
      [:input (merge (dissoc props :on-save :on-stop :title)                 
		     {:type        "text"                                    
		      :value       @val                                      
		      :auto-focus  true                                      
		      :on-blur     save                                      
		      :on-change   #(reset! val (-> % .-target .-value))     
		      :on-key-down #(case (.-which %)                        
				      13 (save)                              
				      27 (stop)                              
				      nil)})])))                             



(defn render
  [props]
  [:div.min-h-full.flex.items-center.justify-center.py-12.px-4.sm:px-6.lg:px-8
   [:div.relative.px-4.w-full.max-w-md.h-full.md:h-auto.max-w-md.w-full.space-y-8
    [:div.p-6
     [:p.text-sm.font-normal.text-gray-500.dark:text-gray-400
      "Connect with one of our available wallet providers."]
     [:ul.my-4.space-y-3
      [:li
       [:div.flex.items-center.p-3.text-base.font-bold.text-gray-900.bg-gray-50.rounded-lg.hover:bg-gray-100.group.hover:shadow.dark:bg-gray-600.dark:hover:bg-gray-500.dark:text-white
	;; metamask
	{:on-click #(open-modal)}
	[:span.flex-1.ml-3.whitespace-nowrap.text-center "CONNECT"]]]]
     [:div
      [:a.inline-flex.items-center.text-xs.font-normal.text-gray-500.hover:underline.dark:text-gray-400
       {:href "#"}
       ;; TODO: provide an explainer
       "\nWhy do I need to connect with my wallet?"]]
     [:div
      [:a.inline-flex.items-center.text-xs.font-normal.text-gray-500.hover:underline.dark:text-gray-400
       {:href "#"}
       "\nPublishing Key"]]
     [todo-input                                   
      {:id "new-todo"                             
       :on-save #(when (seq %)                    
		   )}]
     [:div
      [:a.inline-flex.items-center.text-xs.font-normal.text-gray-500.hover:underline.dark:text-gray-400
       {:href "#"}
       "\nDefault TTL for content"]]
     [todo-input                                   
      {:id "new-todo"                             
       :on-save #(when (seq %)                    
		   )}]
     ]

    ]])

