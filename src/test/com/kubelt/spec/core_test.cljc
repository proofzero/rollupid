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

(deftest profile-test
  (let [data
        {:socials
         {:twitter "twitter",
          :instagram "instagram",
          :linkedin "linkedin",
          :github "github"}
         :nickname "Kubelt",
         :profile-picture "https://kubelt.com/profile-picture",
         :email "hello@kubelt.com",
         :location "Toronto, Canada",
         :job "Building the decentralized web",
         :website "https://kubelt.com",
         :bio "I am Kubelt, a decentralized cloud."}]

    (testing "profile schema is valid"
      (is (malli/validate profile/schema data) "schema doesn't validate"))))
