(ns com.kubelt.rpc.schema-test
  "Test rpc schema"
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures async] ]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]])
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
   [com.kubelt.rpc.schema :as s]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.rpc.schema.fs :as s.fs]
   [com.kubelt.rpc.schema.parse :as rpc.schema.parse]))


(def ^:dynamic json-path "./fix/openrpc/" #_"./../../../fix/openrpc/")

(def data {:openrpc "1.2.6",
           :info {:title "Kubelt Core", :version "0.0.0"},
           :methods
           [{:name "kb_ping",
             :params [],
             :result {:name "pong", :schema {:type "string"}}}]})



(defn check-keys [parsed]
  (is (= (set (keys parsed)) #{:rpc/version :rpc/metadata :rpc/servers :rpc/methods})
      "failing parsed expected keys")
  )

(deftest parse-schema-test
  (testing "parsing rpc api (in edn format)"
    (let [parsed (rpc.schema.parse/parse data {})]
      (check-keys parsed))))

(deftest parse-async-schema-test
  (testing "parsing rpc api (in edn format)"
    (async done
           (go
             (check-keys (try
                           (-> (<p! (s.fs/read-schema (str json-path "links.json")))
                               (rpc.schema.parse/parse  {}))
                           (catch js/Error err (js/console.log (ex-cause err)))))
             (done)))))


(comment
  (t/run-tests)
  ;;
  )
