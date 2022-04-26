(ns com.kubelt.lib.alias
  "Core alias operations"
  {:copyright "©2022 Proof Zero, Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.proto.http :as http]))

(defn add-alias!
  "Add an alias to a core"
  [sys core alias-name target-address]
  ;;{:pre [(string? core)]}
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])

        wallet (get sys :crypto/wallet)
        address (get wallet :wallet/address)
        body {:address address :alias alias-name :target target-address}
        body-str (lib.json/edn->json-str body)

        path (cstr/join "" ["/@" core "/alias/add-alias" ])

        request {:com.kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/body body-str
                 :uri/scheme scheme
                 :uri/domain "127.0.0.1"
                 :uri/port 8787
                 :uri/path path}]
    ;; Make an HTTP request to p2p system, passing along the user's
    ;; wallet address. Expect a nonce in return, which should be signed
    ;; and returned to prove ownership of provided key and complete
    ;; registration.
    ;;
    ;; Returns a promise.
    (println "hereiam in add alias http")
    (http/request! client request)))

(defn lookup!
  "resolve a core address by looking up the alias in a core" 
  [sys core ralias]
  ;;{:pre [(every? string? [core ralias])]}
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        ;;port (get-in sys [:client/p2p :p2p/write :address/port])
        body {}
        body-str (lib.json/edn->json-str body)

        path (cstr/join "" ["/@" core "/alias/" ralias])
        ;;test-request "/@0x7c5b59f22af326e045389f3a123d0b5aba5d0bb2/alias/parent"
        request {:com.kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/body body-str
                 :uri/scheme :http
                 :uri/domain "127.0.0.1"
                 :uri/port 8787
                 :uri/path path}]
                 (http/request! client request)))
