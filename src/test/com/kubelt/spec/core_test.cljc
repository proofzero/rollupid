(ns com.kubelt.spec.core-test
  #?(:clj
     (:require
      [clojure.test :as t :refer [deftest is testing]])
     :cljs
     (:require
      [cljs.test :as t :refer [deftest is testing]]))
  (:require
   [com.kubelt.spec.core.config :as config]
   [com.kubelt.spec.core.profile :as profile]
   [malli.core :as malli]))

(deftest profile-test
  (let [data
        {:socials
         {:twitter "https://twitter.com/kubelt",
          :linkedin "https://www.linkedin.com/company/kubelt",
          :github "https://github.com/kubelt"}
         :nickname "Kubelt",
         :profile-picture "https://twitter.com/kubelt/photo",
         :email "hello@kubelt.com",
         :location "Toronto, Canada",
         :job "Building the decentralized web https://kubelt.notion.site/kubelt/Jobs-4c1b8408d2244797924e53c9eae65f43",
         :website "https://www.kubelt.com",
         :bio "I am Kubelt, a decentralized cloud. CEO https://twitter.com/maurerbot and CTO https://twitter.com/AlFl 🚀"}]

    (testing "profile schema is valid"
      (is (malli/validate profile/schema data) "schema doesn't validate"))))

(deftest minimal-profile-test
  (let [data {:profile-picture "https://kubelt.com/profile-picture"}]
    (testing "minimal profile schema is valid"
      (is (malli/validate profile/schema data) "schema doesn't validate"))))

(deftest config-test
  (let [data {:general
              {:id      {:alias "foo"}
               :client  {:ttl 1234 :media-type "application/json"}
               :aliases [{:alias "Foo" :provider "libp2p://provider_address/rpc"}]
               :metadata
               {:tags ["this" "is" "a" "triumph"] :version "2022-05-23"}}
              :security
              {:auth         {:jwt {:ttl 1234} :nonce {:ttl 1234}}
               :signers      [{:user-id "foo" :key "bar" :roles [{:role-id "bizRole"}]}]
               :roles        [{:role-id "bizRole" :policies ["kPolicy" "zPolicy"]}]
               :policies     [{:policy-id "fooPolicy"
                               :capabilities
                               [{:capability-id "fooCapability"
                                 :caveats [{:type "fooCaveatType" :value ["foo" "bar"]}]}]}]
               :capabilities [{:capability-id "barCapability"
                               :caveats [{:type "barCaveatType" :value ["biz" "baz"]}]}]}}]
    (testing "config data is valid"
      (is (malli/validate config/config data) "schema doesn't validate"))))

(deftest minimal-config-test
  (let [data {:general
              {:client  {:ttl 1234}
               :aliases []
               :metadata
               {:tags [] :version "2022-05-23"}}
              :security
              {:auth         {:jwt {:ttl 1234} :nonce {:ttl 1234}}
               :signers      []
               :roles        []
               :policies     []
               :capabilities []}}]
    (testing "minimal config data is valid"
      (is (malli/validate config/config data) "schema doesn't validate"))))
