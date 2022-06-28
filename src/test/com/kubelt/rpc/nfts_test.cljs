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

(deftest rpc-qn-nfts-test
  (testing "rpc core fetch nfts ... so far jwt not related with wallet(nfts owner) param"
    (async done
           (go
             (try
               (let [config (t.commons/oort-config)
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))
                     api (-> (<p! (sdk.oort/rpc-api sys core))
                             (update :methods conj (<! (lib.test-utils/read-local-edn&go "oort/methods/qn-fetch-nfts.edn"))))
                     nfts (<p! (lib.rpc/rpc-call& kbt api
                                                  {:method  [:qn :fetch-nf-ts]
                                                   :params {:params {:wallet "0x505D79c7379EE65B6c2D6D18a0e7aB901b00756C"
                                                                     :omitFields ["provenance" "traits"]
                                                                     :perPage 1
                                                                     :page 1}}}))]
                 (is (= {:owner "0x505D79c7379EE65B6c2D6D18a0e7aB901b00756C",
                         :assets
                         [{:description "CryptoPunksMarket",
                           :image-url
                           "https://www.larvalabs.com/cryptopunks/cryptopunk1.png",
                           :collection-address "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                           :name "CryptoPunksMarket #1",
                           :collection-token-id "1",
                           :current-owner "0x1919DB36cA2fa2e15F9000fd9CdC2EdCF863E685",
                           :chain "ETH",
                           :collection-name "CryptoPunksMarket",
                           :network "mainnet"}],
                         :page-number 1}
                        ;; not checking totals thus is a changing number over time
                        (dissoc nfts :total-items :total-pages))))
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
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))
                     api (-> (<p! (sdk.oort/rpc-api sys core))
                             (update :methods conj (<! (lib.test-utils/read-local-edn&go "oort/methods/alchemy-get-nfts.edn"))))
                     nfts (<p! (lib.rpc/rpc-call& kbt api
                                                  {:method  [:alchemy :get-nf-ts]
                                                   :params {:params {:owner "0xB0b9cd000A5AFA56d016C39470C3ec237df4e043"}}}))]
                 (is (= #{:owned-nfts :block-hash :total-count :page-key}
                        (set (keys nfts))))

                 (is (= (set (keys (first (:owned-nfts nfts))))
                        #{:description :token-uri :contract :time-last-updated :title :balance :id :media :metadata})))

               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))

(comment
  (t/run-tests)
  )
