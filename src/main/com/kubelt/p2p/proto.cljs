(ns com.kubelt.p2p.proto
  (:require 
    [taoensso.timbre :as log]
    ["hyperbee" :as Hyperbee]))

(defprotocol KVStore
  "Protocol to wrap hyperbee"
  (store [self index value] "save value")
  (query [self index] "query value"))


(defrecord HyperbeeProd [client]
  KVStore
  (store [self index value]
    (.put (:client self) index value))
  (query [self index]
    (.get (:client self) index)))

(defrecord HyperbeeMock []
  KVStore
  (store [self index value]
    (js/Promise.resolve "" ))
  (query [self index]
    (js/Promise.resolve #js {"value" "sup"})
  ))

;; feed and options 
(defn makeKVStore [feed, options] 

  (if
    (nil? feed)
      (do 
        (HyperbeeMock.))
      (do 
       ;; make a js hyperbee client
       (let [client (Hyperbee. feed options)]
         (prn client)
         (HyperbeeProd. client)))))
         ;; (Hyperbee. feed options)))))
         ;; use the js object for production record

