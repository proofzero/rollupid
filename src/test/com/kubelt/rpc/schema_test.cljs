(ns com.kubelt.rpc.schema-test
  "Test rpc schema"
  (:require
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.reader :refer [read-string]]
   [cljs.test :as t :refer [deftest is testing async]])
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.util :as lib.util :refer [node-env]]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.rpc.schema.fs :as s.fs]
   [com.kubelt.rpc.schema.parse :as rpc.schema.parse]))



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
  (testing "checks on oort.edn"
    (async done
           (go
             (try
               (let [data (read-string (str (<p! (s.fs/read-file& (str json-path "oort.edn")))))
                     parsed (rpc.schema.parse/parse data {})]
                 (check-keys parsed)
                 (let [client (rpc.schema/schema (rpc/init) data)]
                   (is (= #{[:kb :auth] [:kb :ping] [:kb :pong]
                            [:kb :auth :verify] [:kb :core :create]
                            [:kb :core :add :signer]}
                          (rpc/available client))
                       "failing methods")
                   (is (=
                        {:com.kubelt/type :kubelt.type/rpc.request,
                         :rpc/path [:kb :ping],
                         :rpc/method
                         {:method/name "kb_ping",
                          :method/summary nil,
                          :method/params {},
                          :method.params/all [],
                          :method.params/required [],
                          :method.params/optional [],
                          :method.params/schemas {}}}
                        (-> (rpc/prepare client [:kb :ping] {})
                            (select-keys   [:com.kubelt/type :rpc/path :rpc/method])))
                       "failing ping prepare expectations")))
               (catch js/Error err (js/console.log err))
               (finally (done)))))))

;; TODO uncomment once our parser works with $refs
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
