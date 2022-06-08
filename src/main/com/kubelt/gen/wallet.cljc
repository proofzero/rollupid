(ns com.kubelt.gen.wallet
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require [com.kubelt.gen.common :as gen.common])
  #?(:cljs (:require ["@ethersproject/wallet" :refer [Wallet]])))

(def ^:private wallet-mock-data
   "generated with/from ether (cljs) logic too (set (repeatedly 5 #(.-address (.createRandom Wallet))));;"
   #{"0x3E2C108FEE24bC552Ba98e3360A97d0912Cc0D63" "0x605b42fdBE0bbdaED4F0BA4158CD94F890292D5e" "0xE7187321fdb2A8E78aca4x122586280571fa21D88" "0xd8e66F535061135643A3579Cc86BF7b860cb0e8A" "0xf46632c8a15d3f19ad9DF5568dE96891eaC48934"})

(defn wallet-address
  [schema]
  (gen.common/re-gen
   schema
   #?(:clj {:gen/elements (map #(apply str (take (+ 2 40) %)) wallet-mock-data)}
      :cljs {:gen/fmap #(.-address (.createRandom Wallet))})))

(defn hex-0x [schema]
  (let [length (gen.common/re-length schema)
        gen (gen.common/gen-fmap-hex (- length 2))]
    (gen.common/re-gen
     schema
     {:gen/fmap
      (fn [_]
        (let [res (gen)]
          (str "0x" res)))})))
