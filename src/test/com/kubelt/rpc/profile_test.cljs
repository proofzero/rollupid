(ns com.kubelt.rpc.profile-test
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async use-fixtures] :as t]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.rpc.test-commons :as t.commons]
   [com.kubelt.lib.test-utils :as lib.test-utils]
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call]
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(use-fixtures :once
  {:before  (lib.test-utils/create-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)})

(deftest rpc-core-profile-test
  (testing "rpc core profile get/set test"
    (async done
           (go
             (try
               (let [config (t.commons/p2p-config)
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.core/authenticate& (assoc sys :crypto/wallet wallet)))
                     api (<p! (sdk.core/rpc-api sys core))
                     profile (<p! (rpc.call/rpc-call& kbt api {:method [:kb :get :profile]}))]
                 (is (= {:profile-picture "DefaultKubeltPFP"} profile))
                 (let [updated-profile-picture "UpdatedProfilePicture"
                       _ (<p! (rpc.call/rpc-call& kbt api {:method [:kb :set :profile]
                                                           :params {:profile {:profilePicture updated-profile-picture}}}))
                       updated-profile (<p! (rpc.call/rpc-call& kbt api {:method [:kb :get :profile]}))]
                   (is (= [{:profile-picture updated-profile-picture}] updated-profile))))
               (catch js/Error err (log/error err))
               (finally (done)))))))

(comment
  "TODO: incosistent get-profile result after set-profile"
  "TODO:  should be rpc params be camelcased?"
  (t/run-tests)
  )
