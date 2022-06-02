(ns dapp.sdk-test
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async] :as t]
   [taoensso.timbre :as log]
   [cljs.reader :as r])
  (:require
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.sdk.v1 :as sdk.v1]))

(deftest storage-support-tests
  (testing "write and read from local storage"
    (async done
           (go
             (try
               (let [app-name "kubelt-dapp"
                     sdk (<p! (sdk.v1/init {:app/name app-name}))]
                 (is (some? sdk))
                 (let [data (-> (:data (<p! (sdk.v1/store&  sdk)))
                                (lib.json/json-str->edn {:decode-key-fn r/read-string}))]
                   (is (some?  (:options data)))
                   (is (some?  (:vault data))))
                 (let [data (<p! (sdk.v1/restore& sdk))]
                   (is (= app-name (:app/name data)))))
               (catch js/Error err (log/error err))
               (finally (done)))))))
