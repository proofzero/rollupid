(ns multiaddr-test
  "Test multiaddr utilities."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.sdk.impl.multiaddr :as multiaddr]))

(deftest vec->multiaddr-str-test
  (testing "convert valid vector"
    (let [host "127.0.0.1"
          port 8080
          v [:ip4 host :tcp port]
          s (multiaddr/vec->str v)]
      (is (string? s)
          "output is a string")
      (is (str/includes? s host)
          "host IP address is included")
      (is (str/includes? s port)
          "host port is included"))))

(deftest str->map-test
  (testing "multiaddr string conversion"
    (let [host "127.0.0.1"
          port 8080
          maddr-str (multiaddr/vec->str [:ip4 host :tcp port])
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
      (is (= port (get maddr-map :address/port)))))

  #_(testing "invalid host address"
    (let [host "localhost"
          port 8080
          maddr-str (multiaddr/vec->str [:ip4 host :tcp port])
          maddr-map (multiaddr/str->map maddr-str)]
      ;; This is an error; how to handle? Fail spec validation? Return
      ;; error map?
      )))
