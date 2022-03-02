(ns com.kubelt.lib.crypto.seed
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.crypto.digest :as lib.digest]))

;; // TODO: SDK
;; const generateSeedFromPhrase = (phrase: string): Uint8Array => {
;;   // needs 256bit for ed25519 seed
;;   // keccak256 produces just that
;;   // heavily used in Ethereum
;;   const hashedSignedMsg = ethers.utils.keccak256(phrase)
;;   const hashedSignedMsgArr = ethers.utils.arrayify(hashedSignedMsg)

;;   return hashedSignedMsgArr
;; }

;; Public
;; -----------------------------------------------------------------------------
;; TODO add variant that produces a signed seed using passed-in signing fn.

(defn from-passphrase
  [passphrase]
  {:assert [(string? passphrase)]}
  (let [seed (lib.digest/sha3-256 passphrase)]
    {:com.kubelt/type :kubelt.type/seed
     :seed/algorithm :seed.algorithm/sha3-256
     :seed/byte-length 32
     ;; TODO store bytes array / Uint8Array
     ;; Make hash fn return map with hex string and bytes
     :seed/hex-string seed}))
