(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.promise :as promise]
   [cljs.core.async :as async :refer [chan go <! >!]]
   [taoensso.timbre :as log]))


(def example
  {:name ::example
   :enter (fn [ctx]
            (log/info {:log/msg "enter"})
            ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(def status-ok
  {:name ::status-ok
   :leave (fn [ctx]
            (assoc-in ctx [:response :http/status] 200))})

(def kbt-resolve
  {:name ::kbt-resolve
   :enter (fn [ctx]
            (log/info {:log/msg "enter kbt resolve"})

            ( let [
                    reqmap (get ctx :request)
                    kbtname (nth (get reqmap :uri/path-components) 2)
                    kbtvalue (.get (get ctx :p2p/hyperbee) [kbtname])
                   ]
              ;; TODO resolve this promise before writing response
;;              (go (promise/all-map [(hash-map "query" kbtvalue)]))
              (log/info {:log/msg kbtname})
              (doto (get ctx :response)
                (.writeHead 200 #js {"content-type" "text/html"})
                (.write (reduce str ["<html><body><h1>" kbtname ": " kbtvalue " </h1></body></html>"]) )
                )

              )


            ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving kbt resolve"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})


(def kbt-update
  {:name ::kbt-update
   :enter (fn [ctx]
            (log/info {:log/msg "enter kbt update"})

            (let [
                    reqmap (get ctx :request)
                    kbtname (nth (get reqmap :uri/path-components) 2)
                    kbtvalue (nth (get reqmap :uri/path-components) 3)
                   ]
 
            ;; todo save value in hyperbee
            (.put (get ctx :p2p/hyperbee) [kbtname kbtvalue]) 

            (log/info {:log/msg kbtname})
            (log/info {:log/msg (get ctx :response)})
            (doto (get ctx :response)

              (.writeHead 200 #js {"content-type" "text/html"})
              (.write (reduce str ["<html><body><h1>SETTING " kbtname " = " kbtvalue " </h1></body></html>"]) )
              )
            )

            ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving kbt update"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})


;; TODO register account here
(def account-register
  {:name ::account-register
   :enter (fn [ctx]
            (log/info {:log/msg "enter account register"})
            ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving account register"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})


