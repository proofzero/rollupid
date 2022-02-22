(ns com.kubelt.lib.wallet
  "Wallet-related utilities. A 'wallet'"
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:cljs
     (:require
      [goog.object]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.spec.wallet :as spec.wallet]))

(defn wallet?
  [x]
  (and
   (map? x)
   (when-let [kbt-type (get x :com.kubelt/type)]
     (= :kubelt.type/wallet kbt-type))))

(defn valid?
  [x]
  (malli/validate spec.wallet/wallet x))

;; TODO support clj/cljs
(defn to-edn
  "Given a JavaScript wallet object, return a corresponding Clojure map."
  [wallet-obj]
  (if-let [sign-fn (goog.object/get wallet-obj "signFn")]
    {:com.kubelt/type :kubelt.type/wallet
     :wallet/sign-fn sign-fn}
    (lib.error/error "missing wallet signing function")))
