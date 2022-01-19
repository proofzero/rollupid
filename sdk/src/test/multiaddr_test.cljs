(ns multiaddr-test
  "Test multiaddr utilities."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.sdk.impl.multiaddr :as multiaddr]))

(deftest str->map-test
  (testing "multiaddr string conversion"
    (let [host "127.0.0.1"
          port 8080
          maddr-str (str "/ip4/" host "/tcp/" port)
          maddr-map (multiaddr/str->map maddr-str)]
      (is (map? maddr-map)
          "conversion result must be a map")
      ;; TODO write a schema for this type
      (is (contains? maddr-map :kubelt/type))
      (is (contains? maddr-map :address/host))
      (is (contains? maddr-map :address/port))
      (is (contains? maddr-map :address/family))
      (is (contains? maddr-map :address/protos))

      ;; TODO more tests
      (is (= host (get maddr-map :address/host)))
      (is (= port (get maddr-map :address/port))))))
