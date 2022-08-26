(ns com.kubelt.lib.test-utils
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.reader :refer [read-string]]
   [cljs.test :refer-macros [is async] :as t])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.util :as lib.util :refer [node-env]]
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.rpc.schema.fs :as s.fs]))

(defn create-wallet
  "Create a temporary wallet to use as part of a test suite."
  [app-name wallet-name wallet-password]
  (go
    (try
      (let [wallet (<p! (wallet/init& app-name wallet-name wallet-password))
            wallet-address (:wallet/address wallet)]
        (log/debug {:log/msg "wallet created" :app/name app-name :wallet/name wallet-name :wallet/address wallet-address})
        wallet)
      (catch js/Error err
        (do (is false err) err)))))

(defn import-wallet
  [app-name wallet-name mnemonic wallet-password]
  (go
    (try
      (let [wallet (<p! (wallet/import& app-name wallet-name mnemonic wallet-password))
            wallet-name (get wallet :wallet/name)
            wallet-address (get wallet :wallet/address)]
        (log/debug {:log/msg "imported wallet" :app/name app-name :wallet/name wallet-name :wallet/address wallet-address})
        name)
      (catch js/Error err
        (do (is false err) err)))))

(defn delete-wallet
  [app-name wallet-name wallet-password & [silently]]
  (go
    (try
      (let [can-decrypt? (<p! (wallet/can-decrypt?& app-name wallet-name wallet-password))]
        (when can-decrypt?
          (let [deleted (<p! (wallet/delete!& app-name wallet-name))]
            (log/debug {:log/msg "wallet deleted" :app/name app-name :wallet/name wallet-name :status/deleted deleted})
            true)))
      (catch js/Error err
        (do (is (or false silently) err) err)))))

(defn create-wallet-fixture
  [app-name wallet-name wallet-password]
  #(async
    done
    (go
      (try
        (<! (create-wallet app-name wallet-name wallet-password))
        (catch js/Error err (js/console.log err))
        (finally (done))))))

(defn import-wallet-fixture
  [app-name wallet-name mnemonic wallet-password]
  #(async
    done
    (go
      (try
        (<! (delete-wallet app-name wallet-name wallet-password true))
        (is (= wallet-name (<! (import-wallet app-name wallet-name mnemonic wallet-password))))
        (catch js/Error err (js/console.log err))
        (finally (done))))))

(defn delete-wallet-fixture
  [app-name wallet-name wallet-password]
  #(async
    done
    (go
      (try
        (<! (delete-wallet app-name wallet-name wallet-password true))
        (catch js/Error err (js/console.log err))
        (finally (done))))))

(def json-path
  (if (= "runner" (:username (node-env)))
    "./fix/openrpc/"
    "./../../../fix/openrpc/"))

(defn read-local-edn&go
  [path]
  (go
    (read-string (str (<p! (s.fs/read-file& (str json-path path)))))))
