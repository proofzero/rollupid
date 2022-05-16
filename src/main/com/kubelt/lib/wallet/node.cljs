(ns com.kubelt.lib.wallet.node
  "The Node.js implementation of a crypto wallet wrapper."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [import])
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
   ["path" :as path])
  (:require
   ["@ethersproject/wallet" :refer [Wallet]])
  (:require
   [cljs.core.async :as async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.path :as lib.path]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.wallet.shared :as lib.wallet]))

(defn- fs-exists?&
  "Return the file location if exists"
  [file]
  (-> (.access fs-promises file  (.. fs -constants -F_OK))
      (lib.promise/then (fn [_] file))
      (lib.promise/catch (fn [_] nil))))

(defn- wallet-dir
  "Return the wallet directory path as a string for an application."
  [app-name]
  (let [config-path (lib.path/data app-name)
        wallet-path (.join path config-path "wallets")]
    wallet-path))

(defn- ensure-wallet-dir&
  "Return the wallet directory path for the application as a string,
  creating it if it doesn't already exist."
  [app-name]
  (let [wallet-dirp (wallet-dir app-name)]
    (-> (fs-exists?& wallet-dirp)
        (lib.promise/then (fn [x]
                            (when-not x
                              (let [mode "0700"
                                    recursive? true
                                    options #js {:mode mode
                                                 :recursive recursive?}]
                                (.mkdir fs-promises wallet-dirp options)))))
        (lib.promise/then (fn [_] wallet-dirp)))))

(defn- name->path
  "Return the path to a wallet given the owning application name and
  wallet name."
  [app-name wallet-name]
  (let [wallet-path (wallet-dir app-name)
        wallet-path (.join path wallet-path wallet-name)]
    wallet-path))

;; Unused predicate
(defn- valid-perms?
  "Return true if the named wallet has the correct permissions, false
  otherwise."
  [app-name wallet-name]
  (let [read-ok (.. fs -constants -R_OK)
        write-ok (.. fs -constants -W_OK)
        perms (bit-or read-ok write-ok)
        wallet-path (name->path app-name wallet-name)]
    (try
      (.accessSync fs wallet-path read-ok)
      (catch js/Error e
        false))))

;; Public
;; -----------------------------------------------------------------------------
;; TODO allow wallet re-creation from mnemonic
;; TODO allow wallet listing
;; TODO allow wallet deletion

(defn has-wallet?&
  "Return true if the named wallet already exists."
  [app-name wallet-name]
  (fs-exists?& (name->path app-name wallet-name)))

(defn can-decrypt?&
  "Return true if the wallet can be successfully decrypted with the
  supplied password, and false otherwise."
  [app-name wallet-name password]
  (-> (has-wallet?& app-name wallet-name)
      (lib.promise/then
       (fn [wallet-path]
         (->
          (.readFile fs-promises wallet-path)
          (lib.promise/then #(.fromEncryptedJson Wallet % password))
          (lib.promise/then (fn [_] true))
          (lib.promise/catch (fn [e]
                               (println e)
                               false))
          (lib.promise/finally (fn []
                               false)))))))

(defn init&
  "Create and store an encrypted wallet. The encrypted wallet file is
  stored in an XDG compliant location based on the application name. It
  is also named using the supplied wallet name and encrypted with the
  supplied password. A map describing the created wallet is returned if
  successful. An error map is returned otherwise."
  [app-name wallet-name password]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (ensure-wallet-dir& app-name)
         (lib.promise/then
          (fn [wallet-dirp]
            (-> (has-wallet?& app-name wallet-name)
                (lib.promise/then
                 (fn [file]
                   (when file
                     (let [message (str "wallet " wallet-name " already exists")]
                       (reject (lib.error/error message))))
                   (let [wallet-path (.join path wallet-dirp wallet-name)
                         eth-wallet (.createRandom Wallet)
                         mnemonic (.-mnemonic eth-wallet)]
                     (-> (.encrypt eth-wallet password)
                         (lib.promise/then #(.writeFile fs-promises wallet-path %))
                         (lib.promise/then (fn []
                                             (resolve
                                              (let [{:keys [phrase path locale]} (js->clj mnemonic :keywordize-keys true)]
                                                {:wallet/path wallet-path
                                                 :wallet/name wallet-name
                                                 :wallet.mnemonic/phrase phrase
                                                 :wallet.mnemonic/path path
                                                 :wallet.mnemonic/locale locale})))))))))))))))

(defn load&
  "Return a promise that resolves to a wallet map, or that rejects with an
  error map if a problem occurs."
  [app-name wallet-name password]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (ensure-wallet-dir& app-name)
         (lib.promise/then
          (fn [wallet-dirp]
            (-> (has-wallet?& app-name wallet-name)
                (lib.promise/then
                 (fn [file]
                   (when-not file
                     (let [message (str "wallet " wallet-name " doesn't exist")]
                       (reject (lib.error/error message))))
                   ;; Load the wallet JSON
                   (let [wallet-path (name->path app-name wallet-name)]
                     (-> (.readFile fs-promises wallet-path "utf8")
                         (lib.promise/then
                          (fn [wallet-str]
                            (let [eth-wallet (.fromEncryptedJsonSync Wallet wallet-str password)
                                  address (.-address eth-wallet)
                                  sign-fn (lib.wallet/make-sign-fn eth-wallet)]
                              (resolve
                               {:com.kubelt/type :kubelt.type/wallet
                                :wallet/address address
                                :wallet/sign-fn sign-fn}))))
                         (lib.promise/catch
                          (fn [error]
                            (reject (lib.error/error error)))))))))))))))

(defn ls&
  "Return a list of wallet names."
  [app-name]
  (-> (ensure-wallet-dir& app-name)
      (lib.promise/then #(js->clj (.readdir fs-promises %)))))

(defn delete!&
  "Delete a wallet."
  [app-name wallet-name]
  (let [wallet-path (name->path app-name wallet-name)]
    (.unlink fs-promises wallet-path)))

(defn create
  ""
  []
  :fixme
  ;; (<! (lib.wallet/random-wallet))
  #_(let [sign-fn (lib.wallet/make-sign-fn eth-wallet)]
      {:wallet/address :fixme
       :wallet/sign-fn sign-fn}))

(defn import&
  "Import a wallet and store it encrypted. Returns a promise that resolves
  to the path to the imported wallet, or if an error occurs rejects with
  a standard error map."
  [app-name wallet-name mnemonic password]
  (lib.promise/promise
   (fn [resolve reject]

     ;; The wallet with the given name doesn't yet exist, we can import
     ;; from the mnemonic and create a wallet with that name.
     (letfn [;; Returns a promise that resolves to the wallet
             ;; JSON. Throws if the mnemonic is invalid.
             (from-mnemonic [mnemonic]
               (try
                 (let [w (.fromMnemonic Wallet mnemonic)]
                   ;; Returns a promise.
                   (.encrypt w password))
                 (catch js/Error e
                   (let [error (lib.error/from-obj e)]
                     (reject error)))))
             ;; Returns the path of the wallet file to write.
             (wallet-path []
               (-> (ensure-wallet-dir& app-name)
                   (lib.promise/then #(.join path % wallet-name))))]
       (let [path& (wallet-path)
             wallet& (from-mnemonic mnemonic)]
         (-> (has-wallet?& app-name wallet-name)
             (lib.promise/then
              (fn [wallet]
                (when wallet
                  (let [msg (str "wallet " wallet-name " already exists")
                        error (lib.error/error msg)]
                    (reject error)))
                (-> (lib.promise/all [path& wallet&])
                    (lib.promise/then
                     (fn [[wallet-dirp wallet-js]]
                       (-> (.writeFile fs-promises wallet-dirp wallet-js)
                           (lib.promise/then
                            (fn [_]
                              (let [result {:wallet/name wallet-name}]
                                (resolve result))))
                           (lib.promise/catch
                            (fn [e]
                              (let [error (lib.error/from-obj e)]
                                (reject error)))))))
                    (lib.promise/catch
                     (fn [e]
                       (let [error (lib.error/from-obj e)]
                         (reject error)))))))))))))
