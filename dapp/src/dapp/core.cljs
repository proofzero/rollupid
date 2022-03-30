(ns dapp.core
  (:require
   [ajax.core :as ajax] 
   [reagent.dom :as rdom]
   [re-frame.core :as re-frame]
   [day8.re-frame.http-fx]
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

;;; Effects ;;;

(def kubelt-db
  {:name "kubelt"
   :user nil})

;;; Events ;;;


(re-frame/reg-event-fx                             ;; note the trailing -fx
              :handler-with-http                      ;; usage:  (dispatch [:handler-with-http])
              (fn [{:keys [db]} _]                    ;; the first param will be "world"
                  {:db   (assoc db :show-twirly true)   ;; causes the twirly-waiting-dialog to show??
                     :http-xhrio {:method          :get
                                  :uri             "https://api.github.com/orgs/day8"
                                  :timeout         8000                                           ;; optional see API docs
                                  :response-format (ajax/json-response-format {:keywords? true})  ;; IMPORTANT!: You must provide this.
                                  :on-success      [::success-http-result]
                                  :on-failure      [:bad-http-result]}}))

(re-frame/reg-event-db
    ::success-http-result
      (fn [db [_ result]]
        (prn {:hereiam "success" :result result})
        (assoc db :success-http-result result)))


       ;; I.e (re-frame/dispatch [::events/load-something-with-ajax])

(re-frame/reg-event-db ::initialize-db
  (fn [db _]
    (re-frame/dispatch [:handler-with-http])
    (if db
      db
      kubelt-db)))


(re-frame/reg-sub ::current-user
  (fn [db]
    (:current-user db)))

(defn init []
  (re-frame/clear-subscription-cache!)
  (re-frame/dispatch-sync [::initialize-db])
  (dev-setup)
  (routes/init-routes!)
  (mount-root))
