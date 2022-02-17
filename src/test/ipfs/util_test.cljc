(ns ipfs.util-test
  "Test the IPFS client-related utilities."
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]))


(deftest api-resource-test
  (testing "valid api resource"
    (let [resource
          {:com.kubelt/type :kubelt.type/api-resource
           :resource/description "test resource"
           :resource/methods [:post]
           :resource/path "/foo"
           :resource/params
           {:example/param
            {:name "arg"
             :description "example parameter"
             :required false
             :spec :boolean}}
           :response/types ["text/plain"]
           :response/spec
           [:map
            [:name :string]]}]
      (is (malli/validate ipfs.spec/api-resource resource)
          "api resource schema is correct"))))
