(ns dapp.sdk-test
  (:require
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async] :as t]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.sdk.v1 :as sdk.v1]))

(deftest storage-support-tests
  (testing "write and read from local storage"
    (async done
           (go
             (try
               (let [app-name "kubelt-dapp"
                     sdk      (<p! (sdk.v1/init {:app/name app-name}))]
                 (is (some? sdk))
                 (let [data (-> (<p! (sdk.v1/store&  sdk))
                                :data
                                (lib.json/json-str->edn))]
                   (is (= data
                          {:options
                           {:credential/jwt    {},
                            :ipfs.read/host    "127.0.0.1",
                            :p2p/host          "127.0.0.1",
                            :p2p/port          8787,
                            :ipfs.write/port   5001,
                            :log/level         :warn,
                            :ipfs.read/scheme  :http,
                            :app/name          "kubelt-dapp",
                            :p2p/scheme        :http,
                            :ipfs.write/scheme :http,
                            :ipfs.write/host   "127.0.0.1",
                            :ipfs.read/port    5001},
                           :vault {:com.kubelt/type :kubelt.type/vault, :vault/tokens {}}})))
                 (let [data (<p! (sdk.v1/restore& sdk))]
                   (is (= app-name (:app/name data)))
                   (is (= #{:credential/jwt
                            :ipfs.read/host
                            :p2p/host
                            :p2p/port
                            :crypto/wallet
                            :ipfs.write/port
                            :log/level
                            :client/p2p
                            :ipfs.read/scheme
                            :client/http
                            :app/name
                            :p2p/scheme
                            :config/storage
                            :ipfs.write/scheme
                            :ipfs.write/host
                            :crypto/session
                            :ipfs.read/port}
                          (set (keys data))))))
               (catch js/Error err (log/error err))
               (finally (done)))))))
