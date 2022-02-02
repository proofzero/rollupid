(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.promise :as promise]
   [cljs.core.async :as async :refer [chan go <! >!]]
   ["jose" :as jose]
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

            (let [reqmap (get ctx :request)
                  kbtname (nth (get reqmap :uri/path-components) 2)
                  kbtvalue (.get (get ctx :p2p/hyperbee) kbtname)]
              
              (log/info {:log/msg kbtname})

              (.then kbtvalue (fn [kval] 
                  (let [kval (str (get (js->clj kval :keywordize-keys true) :value))]
                    (log/info {:log/msg kval})
                                (doto (get ctx :response)
                                  (.writeHead 200 #js {"content-type" "text/html"})
                                  (.end (reduce str ["<html><body><h1>" kbtname ": " kval " </h1></body></html>"])))))))
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

            ;; get relevant values from request
            (let [reqmap (get ctx :request)
                  kbtname (nth (get reqmap :uri/path-components) 2)
                  kbtvalue (nth (get reqmap :uri/path-components) 3)]

                (log/info {:log/msg kbtname})
                (log/info {:log/msg kbtvalue})
                (log/info {:log/msg (get ctx :p2p/hyperbee)})
                (.put (get ctx :p2p/hyperbee) kbtname kbtvalue)
                (doto (get ctx :response)
                  (.writeHead 200 #js {"content-type" "text/html"})
                  (.end (reduce str ["<html><body><h1>SETTING " kbtname " = " kbtvalue " </h1></body></html>"]))))
              ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving kbt update"})
              ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
              ctx)})


(def kbt-update-secure-jwt
  {:name ::kbt-update
   :enter (fn [ctx]
            (log/info {:log/msg "enter kbt update secure jwt"})

            ;; get relevant values from request
            (let [reqmap (get ctx :request)
                  kbtname (nth (get reqmap :uri/path-components) 2)
                  kbtvalue (nth (get reqmap :uri/path-components) 3)]

                (log/info {:log/msg kbtname})
                (log/info {:log/msg kbtvalue})
                (log/info {:log/msg (get ctx :p2p/hyperbee)})
                (.put (get ctx :p2p/hyperbee) kbtname kbtvalue)
                (doto (get ctx :response)
                  (.writeHead 200 #js {"content-type" "text/html"})
                  (.end (reduce str ["<html><body><h1>SETTING " kbtname " = " kbtvalue " </h1></body></html>"]))))
              ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving kbt update secure jwt"})
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


