(ns com.kubelt.lib.test-utils
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.reader :refer [read-string]]
   [cljs.test :refer-macros [is async] :as t]
   [com.kubelt.lib.util :as lib.util :refer [node-env]]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.rpc.schema.fs :as s.fs]))

(defn create-wallet [app-name wallet-name wallet-password]
  (go
    (log/debug "creating-wallet: " wallet-name)
    (try
      (let [w (<p! (wallet/init& app-name wallet-name wallet-password))]
        (is true "wallet created")
        w)
      (catch js/Error err (do (is false err) err)))))

(defn delete-wallet [app-name wallet-name wallet-password]
  (go
    (log/debug "deleting-wallet: " wallet-name)
    (try
      (let [can-decrypt? (<p! (wallet/can-decrypt?& app-name wallet-name wallet-password))]
        (log/debug "can-decrypt?: " can-decrypt?)
        (when can-decrypt?
          (let [deleted (<p! (wallet/delete!& app-name wallet-name))]
            (log/debug :deleted deleted)
            true)))
      (catch js/Error err (do (is false err) err)))))

(defn create-wallet-fixture [app-name wallet-name wallet-password]
  #(async
    done
    (go
      (try
        (<! (create-wallet app-name wallet-name wallet-password))
        (catch js/Error err (js/console.log err))
        (finally (done))))))

(defn delete-wallet-fixture [app-name wallet-name wallet-password]
  #(async
    done
    (go
      (try
        (<! (delete-wallet app-name wallet-name wallet-password))
        (catch js/Error err (js/console.log err))
        (finally (done))))))

(def json-path
  (if (= "runner" (:username (node-env)))
    "./fix/openrpc/"
    "./../../../fix/openrpc/"))

(defn read-local-edn&go [path]
  (go
    (read-string (str (<p! (s.fs/read-file& (str json-path path)))))))
