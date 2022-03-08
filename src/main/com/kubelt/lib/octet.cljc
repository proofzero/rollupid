(ns com.kubelt.lib.octet
  "Byte-related utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [java.nio.charset StandardCharsets]))
  #?(:cljs
     (:require
      ["@stablelib/utf8" :as utf8])))

;; TODO rename to str->utf8-bytes?
(defn- str->bytes
  "Convert the input into a platform-specific byte sequence. In Clojure, a
  byte array is returned. In ClojureScript, a Uint8Array is
  returned.

  Note that Node.js Buffer objects are a subclass of the JavaScript
  Uint8Array class that extends it with additional methods. Node.js APIs
  accept plain Uint8Arrays wherever Buffers are supported as well, so we
  prefer to work just with Uint8Array, if possible. Also note that
  JavaScript strings are encoded as UTF-16 by default, whereas in node
  they're UTF-8 encoded, so we need to perform some conversion first."
  [x]
  {:pre [(string? x)]}
  #?(:clj (if-not (bytes? x)
            (let [charset (StandardCharsets/UTF_8)]
              (.getBytes x charset))
            x)
     :cljs (.encode utf8 x)))

;; Using Buffer.from() works!
;; Using Uint8Array.from() does *not* work!

#_(let [encoder (js/TextEncoder.)]
    (.encode encoder x))

#_(js/Uint8Array.from x)

#_(js/Buffer.from x)

;; Public
;; -----------------------------------------------------------------------------
;; TODO test me

(defn as-bytes
  [x]
  (cond
    (string? x) (str->bytes x)
    ;; TODO if given bytes, return bytes. Need x-platform (bytes?).
    :else x))
