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
                     sdk      (<p! (sdk.v1/init {:app/name app-name}))
                     vault {:com.kubelt/type :kubelt.type/vault, :vault/tokens {}}]
                 (is (some? sdk))
                 (let [data (-> (<p! (sdk.v1/store&  sdk))
                                :data
                                (lib.json/json-str->edn))]
                   (is (= data
                          {:options
                           {:app/name          "kubelt-dapp",
                            :credential/jwt    {},
                            :oort/scheme        :http,
                            :oort/host          "127.0.0.1",
                            :oort/port          8787,
                            :ipfs.read/scheme  :http,
                            :ipfs.read/host    "127.0.0.1",
                            :ipfs.read/port    5001
                            :ipfs.write/scheme :http,
                            :ipfs.write/host   "127.0.0.1",
                            :ipfs.write/port   5001,
                            :log/level         :warn},
                           :vault vault})))
                 (let [data (<p! (sdk.v1/restore& sdk))]
                   (is (= app-name (:app/name data)))
                   (is (= vault (:crypto/session data)))
                   (is (= #{:app/name
                            :client/http
                            :client/oort
                            :config/storage
                            :credential/jwt
                            :crypto/session
                            :crypto/wallet
                            :ipfs.read/host
                            :ipfs.read/port
                            :ipfs.read/scheme
                            :ipfs.write/host
                            :ipfs.write/port
                            :ipfs.write/scheme
                            :log/level
                            :oort/host
                            :oort/port
                            :oort/scheme}
                          (set (keys data))))))
               (catch js/Error err (log/error err))
               (finally (done)))))))
