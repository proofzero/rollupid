(ns com.kubelt.lib.wallet
  "Wallet-related utilities."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  #?(:cljs
     (:require
      [goog.object]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.spec.wallet :as spec.wallet])
  #?(:node
     (:require
      [com.kubelt.lib.wallet.node :as wallet.node])))

;; Public
;; -----------------------------------------------------------------------------

(defn wallet?
  [x]
  (and
   (map? x)
   (when-let [kbt-type (get x :com.kubelt/type)]
     (= :kubelt.type/wallet kbt-type))))

(defn valid?
  [x]
  ;; TODO sign a fixed value and ensure expected output, and/or other
  ;; measures to ensure wallet performs as expected at runtime.
  (and (wallet? x)
       (malli/validate spec.wallet/wallet x)))

(defn explain
  "Return an explanation as to why a wallet is invalid."
  [wallet]
  (let [explain (lib.error/explain spec.wallet/wallet wallet)]
    ;; If there's no error in validating the wallet, presumably a
    ;; dynamic function check failed, i.e. invoking the signing function
    ;; resulted in an unexpected signature output, etc.
    ;;
    ;; TODO check if explain resulted in an error, and if not, check
    ;; functionality.
    explain))

;; TODO support clj/cljs
(defn to-edn
  "Given a JavaScript wallet object, return a corresponding Clojure map."
  [wallet-obj]
  (let [address (goog.object/get wallet-obj "address")
        sign-fn (goog.object/get wallet-obj "signFn")]
    {:com.kubelt/type :kubelt.type/wallet
     :wallet/address address
     :wallet/sign-fn sign-fn}))

(defn no-op
  "Return a no-op wallet that can be used as a placeholder."
  []
  {:post [(valid? %)]}
  (let [null-address "0x00000000000000000000"
        null-key {:com.kubelt.type :kubelt.type/public-key
                  :key/data ""}]
    {:com.kubelt/type :kubelt.type/wallet
     :wallet/address null-address
     :wallet/encrypt-key null-key
     :wallet/decrypt-fn identity
     :wallet/sign-fn identity}))

#?(:node
   (defn has-wallet?
     "Return true if named wallet exists, and false otherwise."
     [app-name wallet-name]
     {:pre [(every? string? [app-name wallet-name])]}
     (wallet.node/has-wallet? app-name wallet-name)))

#?(:node
   (defn can-decrypt?
     "Return true if the wallet can be successfully decrypted with the
     supplied password, and false otherwise."
     [app-name wallet-name password]
     {:pre [(every? string? [app-name wallet-name password])]}
     (wallet.node/can-decrypt? app-name wallet-name password)))

#?(:node
   (defn init
     "Initialize a wallet."
     [app-name wallet-name password]
     {:pre [(every? string? [app-name wallet-name password])]}
     (wallet.node/init app-name wallet-name password)))

#?(:node
   (defn load
     "Load a wallet."
     [app-name wallet-name password]
     {:pre [(every? string? [app-name wallet-name password])]}
     (wallet.node/load app-name wallet-name password)))

#?(:node
   (defn ls
     "List wallets."
     [app-name]
     {:pre [(string? app-name)]}
     (wallet.node/ls app-name)))

#?(:node
   (defn delete!
     "Delete a wallet."
     [app-name wallet-name]
     {:pre [(every? string? [app-name wallet-name])]}
     (wallet.node/delete! app-name wallet-name)))

;; TODO
(defn create
  "Create a platform-appropriate wallet."
  []
  #?(:node (wallet.node/create)))
