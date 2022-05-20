(ns com.kubelt.rpc.schema-test
  "Test rpc schema"
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.reader :refer [read-string]]
   [cljs.test :as t :refer [deftest is testing async]]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.util :as lib.util :refer [node-env]]
   [com.kubelt.rpc.schema :as s]
   [com.kubelt.rpc.schema.fs :as s.fs]
   [com.kubelt.rpc.schema.parse :as rpc.schema.parse]
   [malli.core :as malli]))


(def json-path
  (if (= "runner" (:username (node-env)))
    "./fix/openrpc/"
    "./../../../fix/openrpc/"))


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


(deftest parse-be-schema-test
  (testing "checks on be.edn "
    (async done
           (go
             (try
               (let [data (read-string (str (<p! (s.fs/read-file& (str json-path "be.edn")))))
                     parsed (rpc.schema.parse/parse data {})]
                 (check-keys parsed)
                 )
               (catch js/Error err (js/console.log err))
               (finally (done)))))))



#_(deftest parse-async-schema-test
  (testing "parsing rpc api (in edn format)"
    (async done
           (go
             (try
               (doseq [filename  ["empty.json" "ethereum.json" "links.json" "petstore-by-name.json"
                                  "petstore-expanded.json" "petstore.json" "simple-math.json" "api-simple.json"]]
                 (println filename)
                 (check-keys (-> (<p! (s.fs/read-schema (str json-path filename)))
                                 (rpc.schema.parse/parse  {}))))

               (catch js/Error err (js/console.log err)))
             (done)))))


(comment
  (t/run-tests)

  (go
    (try
      (def x (<p! (s.fs/read-schema (str json-path "ethereum.json")))
        )
       (rpc.schema.parse/parse x {})
      ;; (rpc.schema.validate/validate x)
      ;; (rpc.schema.expand/expand x)
      (catch js/Error err (js/console.log err))))

  ;;
  )
