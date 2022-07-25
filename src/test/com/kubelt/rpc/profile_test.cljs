(ns com.kubelt.rpc.profile-test
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async use-fixtures] :as t])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.rpc :as lib.rpc]
   [com.kubelt.lib.test-utils :as lib.test-utils]
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.rpc.test-commons :as t.commons]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.oort :as sdk.oort]))

(use-fixtures :once
  {:before  (lib.test-utils/create-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)})

(deftest rpc-core-profile-test
  (testing "rpc core profile get/set test"
    (async done
           (go
             (try
               (let [config (t.commons/oort-config)
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))
                     api (<p! (sdk.oort/rpc-api sys core))
                     profile (-> (<p! (lib.rpc/rpc-call& kbt api {:method [:kb :get-profile]}))
                                 :http/body :result)]
                 (is (= {:profile-picture
                         {:name "DefaultKubeltPFP"
                          :image-url ""
                          :collection-id ""
                          :collection-token-id ""}} profile))
                 (let [updated-profile-picture
                       {:profile-picture
                        {:name "UpdatedProfilePicture"
                         :image-url ""
                         :collection-id ""
                         :collection-token-id ""}}
                       _ (<p! (lib.rpc/rpc-call& kbt api {:method [:kb :set-profile]
                                                          :params {:profile updated-profile-picture}}))
                       updated-profile (-> (<p! (lib.rpc/rpc-call& kbt api {:method [:kb :get-profile]}))
                                           :http/body :result)]
                   (is (= updated-profile-picture updated-profile))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))

(comment
  "TODO:  should be rpc params be camelcased?"
  (t/run-tests)
  )
