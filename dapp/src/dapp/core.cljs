(ns dapp.core
  (:require
    [com.kubelt.lib.http.browser :as lib.http]
    [com.kubelt.lib.p2p :as lib.p2p]
    [com.kubelt.sdk.v1 :as sdk.v1]
    [com.kubelt.sdk.v1.core :as sdk.core]
    [reagent.dom :as rdom]
    [re-frame.core :as re-frame]
    [dapp.config :as config]
    [dapp.views :as views]
    [dapp.routes :as routes]))
 

(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel {:router routes/router}] root-el)))

;;; Effets ;;;

(def kubelt-db
  {:name "kubelt"
   :user nil})

;;; Events ;;;

(re-frame/reg-event-db ::initialize-db
                       (fn [db _]
                         (let [ctx (sdk.v1/init)]
                           ;; TODO wip calling http client from browser context
                           #_(lib.p2p/authenticate! ctx "0x00000000000000000000" )
                           #_(lib.p2p/verify! ctx "0x00000000000000000000" "fixmenonce" "fixmesig" )
                           (sdk.core/authenticate! ctx "0x00000000000000000000")
                           )))

(re-frame/reg-sub ::current-user
                  (fn [db]
                    (:current-user db)))

(defn init []
  (re-frame/clear-subscription-cache!)
  (re-frame/dispatch-sync [::initialize-db])
  (dev-setup)
  (routes/init-routes!)
  (mount-root))
