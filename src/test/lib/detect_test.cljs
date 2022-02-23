(ns lib.detect-test
  "Test node and gateway detection utilities."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [com.kubelt.lib.config :as config]
   [com.kubelt.lib.detect :as detect]))

(deftest local-node?-test
  (testing "local node"
    (let [is-local (detect/local-node?)]
      ;; TODO
      (is (not is-local)
          "fixme: currently this always returns false"))))

(deftest node-or-gateway-test
  (testing "local node for read/write"
    (testing "default options"
      (let [p2p-read (get config/default-p2p :p2p/read)
            p2p-write (get config/default-p2p :p2p/write)
            options {}
            settings (detect/node-or-gateway config/default-p2p options)]
        (is (= p2p-read (get settings :p2p/read))
            "read host should be default local node")
        (is (= p2p-write (get settings :p2p/write))
            "write host should be default local node")))

    (testing "remote read host"
      ;; TODO
      ))

  (testing "remote node for read/write"
    ;; TODO
    )

  (testing "local node read, remote node write"
    ;; TODO
    )

  (testing "local node write, remote node read"
    ;; TODO
    ))
