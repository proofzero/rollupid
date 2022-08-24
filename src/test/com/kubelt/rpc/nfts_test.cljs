(ns com.kubelt.rpc.nfts-test
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

#_(deftest rpc-qn-nfts-test
  (testing "rpc core fetch nfts ... so far jwt not related with wallet(nfts owner) param"
    (async done
           (go
             (try
               (let [config (t.commons/oort-config)
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet) {}))
                     api (-> (<p! (sdk.oort/rpc-api sys core))
                             (update :methods conj (<! (lib.test-utils/read-local-edn&go "oort/methods/qn-fetch-nfts.edn"))))
                     nfts (-> (<p! (lib.rpc/rpc-call& kbt api
                                                   {:method  [:qn :fetch-nf-ts]
                                                    :params {:params {:wallet "0x505D79c7379EE65B6c2D6D18a0e7aB901b00756C"
                                                                      :omitFields ["provenance" "traits"]
                                                                      :perPage 1
                                                                      :page 1}}}))
                              :http/body :result)]
                 (is (= #{:owner :assets :page-number}
                        ;; not checking totals thus is a changing number over time
                        (set (keys (dissoc nfts :total-items :total-pages)))))
                 (is (= #{:description :image-url :collection-address :name :collection-token-id :current-owner :chain :collection-name :network}
                        (set (keys (-> nfts :assets first))))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))

(deftest rpc-alchemy-nfts-test
  (testing "rpc core fetch alchemy-nfts ... so far jwt not related with wallet(nfts owner) param"
    (async done
           (go
             (try
               (let [config (t.commons/oort-config)
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet) {}))
                     api (<p! (sdk.oort/rpc-api sys core))
                     nfts (-> (<p! (lib.rpc/rpc-call& kbt api
                                                      {:method  [:alchemy :get-nf-ts]
                                                       :params {:params {:owner "0xB0b9cd000A5AFA56d016C39470C3ec237df4e043"}}}))
                              :http/body :result)]
                 (is (= #{:owned-nfts :block-hash :total-count :page-key}
                        (set (keys nfts))))

                 (is (= (set (keys (first (:owned-nfts nfts))))
                        #{:description :token-uri :contract :time-last-updated :title :balance :id :media :contract-metadata :metadata})))

               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))

(comment
  (t/run-tests)
  )
