(ns com.kubelt.p2p.proto
  (:require 
    [taoensso.timbre :as log])
  (:require 
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
    (js/Promise.resolve "fixme" ))
  (query [self index]
    (js/Promise.resolve #js {"value" "sup"})
    ))

;; feed and options 
(defn make-kv-store [feed, options] 

  (if
    (nil? feed)
    (HyperbeeMock.)
    ;; make a js hyperbee client
    (let [client (Hyperbee. feed options)]
      (HyperbeeProd. client))))
;; (Hyperbee. feed options)))))
;; use the js object for production record

