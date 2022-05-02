(ns lib.config-test
  "Test SDK configuration maps."
  (:require
   [cljs.test :as t :refer [deftest is testing]]
   [malli.core :as malli]
   [com.kubelt.lib.config.default :as lib.config.default]
   [com.kubelt.spec.config :as spec.config]))

(def sdk-conf (lib.config.default/sdk {}))

(def sdk-config (spec.config/sdk-config {}))

(defn with-defaults [conf]
  (merge sdk-conf conf))

(deftest config-test
  (testing "default config is valid"
    (is (malli/validate sdk-config sdk-conf)
        "default options must be valid"))

  (testing "logging levels"
    (testing "log level"
      (let [options (with-defaults {:log/level :log})]
        (is (malli/validate sdk-config options)
            "logging min-level of :log is valid")))
    (testing "trace level"
      (let [options (with-defaults {:log/level :trace})]
        (is (malli/validate sdk-config options)
            "logging min-level of :trace is valid")))
    (testing "debug level"
      (let [options (with-defaults {:log/level :debug})]
        (is (malli/validate sdk-config options)
            "logging min-level of :debug is valid")))
    (testing "info level"
      (let [options (with-defaults {:log/level :info})]
        (is (malli/validate sdk-config options)
            "logging min-level of :info is valid")))
    (testing "warn level"
      (let [options (with-defaults {:log/level :warn})]
        (is (malli/validate sdk-config options)
            "logging min-level of :warn is valid")))
    (testing "error level"
      (let [options (with-defaults {:log/level :error})]
        (is (malli/validate sdk-config options)
            "logging min-level of :error is valid")))
    (testing "fatal level"
      (let [options (with-defaults {:log/level :fatal})]
        (is (malli/validate sdk-config options)
            "logging min-level of :fatal is valid"))))

  (testing "ipfs settings"
    (testing "invalid address"
      (testing "read address"
        (let [options (with-defaults {:ipfs.read/multiaddr "127.0.0.1"})]
          (is (not (malli/validate sdk-config options))
              "a dotted-quad is not a valid address"))
        (let [options (with-defaults {:ipfs.read/multiaddr "localhost"})]
          (is (not (malli/validate sdk-config options))
              "localhost is not a valid host name")))
      (testing "write address"
        (let [options (with-defaults {:ipfs.write/multiaddr "127.0.0.1"})]
          (is (not (malli/validate sdk-config options))
              "a dotted-quad is not a valid address"))
        (let [options (with-defaults {:ipfs.write/multiaddr "localhost"})]
          (is (not (malli/validate sdk-config options))
              "localhost is not a valid host name"))))

    (testing "invalid scheme"
      (let [options (with-defaults {:ipfs.read/scheme :foobar})]
        (is (not (malli/validate sdk-config options))
            "scheme should be :http or :https"))
      (let [options (with-defaults {:ipfs.write/scheme :foobar})]
        (is (not (malli/validate sdk-config options)))))

    (testing "multiaddr"
      (testing "localhost"
        (let [options (with-defaults {:ipfs.read/multiaddr "/ip4/127.0.0.1"})]
          (is (malli/validate sdk-config options)
              "loopback IP is a valid network address"))
        (let [options (with-defaults {:ipfs.read/multiaddr "/ip4/localhost"})]
          (is (malli/validate sdk-config options)
              "localhost is a valid network address"))
        (let [options (with-defaults {:ipfs.read/multiaddr "/ip4/127.0.0.1/tcp/8080"})]
          (is (malli/validate sdk-config options)
              "localhost:8080 is a valid network address")))))

  (testing "p2p settings"
    (testing "invalid address"
      (let [options (with-defaults {:p2p/multiaddr "127.0.0.1"})]
        (is (not (malli/validate sdk-config options))
            "a dotted-quad is not a valid address"))
      (let [options (with-defaults {:p2p/multiaddr "localhost"})]
        (is (not (malli/validate sdk-config options))
            "localhost is not a valid host name")))
    (testing "invalid scheme"
      (let [options (with-defaults {:p2p/scheme :foobar})]
        (is (not (malli/validate sdk-config options))
            "scheme should be :http or :https")))

    (testing "multiaddr"
      (testing "localhost"
        (let [options (with-defaults {:ipfs.read/multiaddr "/ip4/127.0.0.1"})]
          (is (malli/validate sdk-config options)
              "loopback IP is a valid network address"))
        (let [options (with-defaults {:ipfs.read/multiaddr "/ip4/localhost"})]
          (is (malli/validate sdk-config options)
              "localhost is a valid network address"))
        (let [options (with-defaults {:ipfs.read/multiaddr "/ip4/127.0.0.1/tcp/8080"})]
          (is (malli/validate sdk-config options)
              "localhost:8080 is a valid network address"))))))
