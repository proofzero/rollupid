(ns com.kubelt.spec.profile-test
  #?(:clj
     (:require
      [clojure.test :as t :refer [deftest is testing]])
     :cljs
     (:require
      [cljs.test :as t :refer [deftest is testing]]))
  (:require
   [com.kubelt.spec.core.profile :as profile]
   [malli.core :as malli]))

(deftest config-test
  (let [data {:socials
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

    (testing "config data is valid"
      (is (malli/validate profile/profile-config data) "schema doesn't validate"))))
