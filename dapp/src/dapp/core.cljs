(ns dapp.core
  (:require
    [com.kubelt.lib.http.browser :as lib.http]
    [com.kubelt.lib.p2p :as lib.p2p]
    [com.kubelt.sdk.v1 :as sdk.v1]
    [com.kubelt.sdk.v1.core :as sdk.core]
    [com.kubelt.proto.http :as http]
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

;; temp
(defn check-version
  [sys]

 (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        body-str ""
        path "/version"
        request {:com.kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/body body-str
                 :uri/scheme scheme
                 :uri/domain host
                 :uri/port port
                 :uri/path path}]
    (http/request! client request)))

(re-frame/reg-event-db ::initialize-db
                       (fn [db _]
                         (let [ctx (sdk.v1/init)]
                           ;; TODO wip calling http client from browser context
                           #_(lib.p2p/authenticate! ctx "0x00000000000000000000" )
                           #_(lib.p2p/verify! ctx "0x00000000000000000000" "fixmenonce" "fixmesig" )
                           #_(sdk.core/authenticate! ctx "0x00000000000000000000")

                           ;; check version via http client
                           (check-version ctx)
                            ctx
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
