(ns com.kubelt.ddt.cmds.rpc.ls
  "List available RPC methods."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.spec.openrpc :as spec.openrpc]
   [com.kubelt.lib.promise :as lib.promise]
   [malli.core :as mc]
   [com.kubelt.sdk.v1.core :as sdk.core]
   [com.kubelt.ddt.cmds.sdk.core.authenticate :as ddt.auth]
   [com.kubelt.proto.http :as proto.http]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.rpc :as rpc]))

(defonce command
  {:command "list"
   :aliases ["ls"]
   :desc "List available RPC methods."
  :requiresArg false

  :builder (fn [^Yargs yargs]
             ;; Include the common options.
             (ddt.options/options yargs)
             yargs)

  :handler (fn [args]
             (ddt.prompt/ask-password!
              (fn [err result]
                (ddt.util/exit-if err)
                (ddt.auth/authenticate
                 (ddt.options/to-map args)
                 (.-password result)
                 (fn [sys]
                   (println

                    (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                        (lib.promise/then (fn [api]
                                            (->> (lib.json/json-str->edn api lib.json/keyword-mapper)
                                                 (rpc/init "url" )
                                                 (println )
                                                )


                                            (println api)))
                        )

                    )
                   (prn "joeee" (-> sys :crypto/wallet :wallet/address)  ))))))})

(comment

  (def x (lib.json/json-str->edn
          "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"result\": {
        \"openrpc\": \"1.2.6\",
        \"info\": {
            \"title\": \"Kubelt Core\",
            \"version\": \"0.0.0\"
        },
        \"methods\": [
            {
                \"name\": \"kb_ping\",
                \"params\": [],
                \"result\": {
                    \"name\": \"pong\",
                    \"schema\": {
                        \"type\": \"string\"
                    }
                }
            },
            {
                \"name\": \"kb_pong\",
                \"params\": [],
                \"result\": {}
            },
            {
                \"name\": \"kb_auth\",
                \"params\": [
                    {
                        \"name\": \"address\",
                        \"summary\": \"Account address\",
                        \"required\": true,
                        \"schema\": {
                            \"type\": \"string\"
                        }
                    }
                ],
                \"result\": {
                    \"name\": \"nonce\",
                    \"schema\": {
                        \"type\": \"string\"
                    }
                }
            },
            {
                \"name\": \"kb_auth_verify\",
                \"params\": [
                    {
                        \"name\": \"nonce\",
                        \"summary\": \"Challenge Nonce\",
                        \"required\": true,
                        \"schema\": {
                            \"type\": \"string\"
                        }
                    },
                    {
                        \"name\": \"signature\",
                        \"summary\": \"Nonce Signature\",
                        \"required\": true,
                        \"schema\": {
                            \"type\": \"string\"
                        }
                    }
                ],
                \"result\": {
                    \"name\": \"jwt\",
                    \"schema\": {
                        \"type\": \"string\"
                    }
                }
            }
        ]
    }
}"
          lib.json/keyword-mapper))
  (lib.error/explain (mc/schema spec.openrpc/schema*) (:result x) )
  (rpc/init "url" (:result x))

  (-> (proto.http/request! (com.kubelt.lib.http.node/->HttpClient.)
                           {:com.kubelt/type :kubelt.type/http-request
                            :http/method :get
                            :uri/scheme :https
                            :uri/domain "raw.githubusercontent.com"
                            :uri/path "/kubelt/kubelt/main/fix/openrpc/ethereum.json"})

      (.then (fn [x]
               (def data-schema (-> x :http/body (lib.json/json-str->edn lib.json/keyword-mapper)))))
      (.catch (fn [e] (println "error " e))))
  (def rpc (rpc/init "url" data-schema)))
