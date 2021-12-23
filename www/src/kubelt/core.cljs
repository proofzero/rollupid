(ns kubelt.core
  (:require
   [reagent.dom :as rdom]
   [re-frame.core :as re-frame]
   [re-pressed.core :as rp]
   [breaking-point.core :as bp]
   [kubelt.events :as events]
   [kubelt.routes :as routes]
   [kubelt.views :as views]
   [kubelt.config :as config]))


(defn dev-setup []
  (when config/debug?
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (re-frame/clear-subscription-cache!)
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel] root-el)))

(defn init []
  (routes/start!)
  (re-frame/dispatch-sync [::events/initialize-db])
  (re-frame/dispatch-sync [::rp/add-keyboard-event-listener "keydown"])
  (re-frame/dispatch-sync [::bp/set-breakpoints
                           {:breakpoints [:mobile 768
                                          :tablet 992
                                          :small-monitor 1200
                                          :large-monitor]
                            :debounce-ms 166}])
  (dev-setup)
  (mount-root)

  ;; EXAMPLE web worker
  ;;
  ;; NB: stop a worker by calling worker.terminate() from page context,
  ;; or by calling self.close() from within the worker itself.
  (let [worker (js/Worker. "/js/compiled/worker.js")]
    (.. worker (addEventListener "message" (fn [e] (js/console.log e))))
    (.. worker (postMessage (clj->js {:message "hello world"})))
    (.. worker (postMessage (clj->js {:message "goodbye world"})))))
