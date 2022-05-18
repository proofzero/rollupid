(ns lib.config-test
  "Test SDK configuration maps."
  #?(:clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]])
     :cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.config.default :as lib.config.default]
   [com.kubelt.spec.config :as spec.config]))

(defn with-defaults [conf]
  (merge lib.config.default/sdk conf))

(deftest config-test
  (testing "default config is valid"
    (is (malli/validate spec.config/sdk-config lib.config.default/sdk)
        "default options must be valid"))

  (testing "logging levels"
    (testing "log level"
      (let [options (with-defaults {:log/level :log})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :log is valid")))
    (testing "trace level"
      (let [options (with-defaults {:log/level :trace})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :trace is valid")))
    (testing "debug level"
      (let [options (with-defaults {:log/level :debug})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :debug is valid")))
    (testing "info level"
      (let [options (with-defaults {:log/level :info})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :info is valid")))
    (testing "warn level"
      (let [options (with-defaults {:log/level :warn})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :warn is valid")))
    (testing "error level"
      (let [options (with-defaults {:log/level :error})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :error is valid")))
    (testing "fatal level"
      (let [options (with-defaults {:log/level :fatal})]
        (is (malli/validate spec.config/sdk-config options)
            "logging min-level of :fatal is valid"))))

  (testing "ipfs settings"
    (testing "valid address"
      (testing "read address"
        (let [options (with-defaults {:ipfs.read/host "192.168.1.1"})]
          (is (malli/validate spec.config/sdk-config options)
              "a dotted-quad string is a valid host"))
        (let [options (with-defaults {:ipfs.read/port 1234})]
          (is (malli/validate spec.config/sdk-config options)
              "an integer is a valid port")))

      (testing "write address"
        (let [options (with-defaults {:ipfs.read/host "192.168.1.1"})]
          (is (malli/validate spec.config/sdk-config options)
              "a dotted-quad string is a valid host"))
        (let [options (with-defaults {:ipfs.read/port 1234})]
          (is (malli/validate spec.config/sdk-config options)
              "an integer is a valid port"))))

    (testing "invalid scheme"
      (let [options (with-defaults {:ipfs.read/scheme :foobar})]
        (is (not (malli/validate spec.config/sdk-config options))
            "scheme should be :http or :https"))
      (let [options (with-defaults {:ipfs.write/scheme :foobar})]
        (is (not (malli/validate spec.config/sdk-config options))))))

  (testing "p2p settings"
    (testing "valid address"
      (let [options (with-defaults {:p2p/host "127.0.0.1"})]
        (is (malli/validate spec.config/sdk-config options)
            "a dotted-quad string is a valid host"))
      (let [options (with-defaults {:p2p/port 1234})]
        (is (malli/validate spec.config/sdk-config options)
            "an integer is a valid port")))

    (testing "invalid scheme"
      (let [options (with-defaults {:p2p/scheme :foobar})]
        (is (not (malli/validate spec.config/sdk-config options))
            "scheme should be :http or :https")))))
