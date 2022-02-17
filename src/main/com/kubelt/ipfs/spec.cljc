(ns com.kubelt.ipfs.spec
  "IPFS client schemas."
  (:require
   [com.kubelt.spec.http :as spec.http]))

;; TODO migrate these into shared com.kubelt.spec namespace when they
;; aren't specific to this IPFS client implementation.

;; Schema
;; -----------------------------------------------------------------------------
;; Describe the shape of the map used to describe an IPFS RESTful API
;; resource endpoint.

(def api-base
  [:map
   [:api/version :keyword]
   [:path/prefix :string]])

;; TODO is there a more general way, ideally provided by malli itself,
;; to validate that a given data value is a valid schema itself?
;; Using :schema naiively doesn't appear to work.
(def api-spec
  :any
  #_:schema
  #_[:or :keyword :map :symbol :vector])

;; A vector of supported HTTP methods.
(def http-methods
  [:vector spec.http/method])

(def media-types
  [:vector spec.http/media-type])

(def api-params
  [:map-of {:closed true}
   :keyword
   [:map
    [:name spec.http/param-name]
    [:description :string]
    [:required :boolean]
    [:spec api-spec]]])

(def param-conflicts
  [:vector
   [:set :keyword]])

;; Spec for the IPFS method map descriptor.
(def api-resource
  [:map {:closed true}
   [:com.kubelt/type [:enum :kubelt.type/api-resource]]
   [:resource/description :string]
   [:resource/methods http-methods]
   [:resource/path :string]
   ;; TODO map must have only single entry as there can only be a single
   ;; request body? True for multipart/form-data?
   [:resource/body {:optional true} api-params]
   ;; A body fn transforms the supplied value for the body into
   ;; something our HTTP client knows how to deal with, e.g. a set of
   ;; maps representing multipart form data.
   [:resource/body-fn {:optional true}
    [:=> [:cat spec.http/param-name :any]
     [:or spec.http/multipart]]]
   [:resource/conflicts {:optional true} param-conflicts]
   [:resource/params api-params]
   [:response/types media-types]
   [:response/spec api-spec]
   [:response/body-fn {:optional true}
    ;; TODO replace :map argument with recursive reference to
    ;; api-resource (using registry?).
    [:=> [:cat :map :any] :any]]
   ;; Added by parameter checking functions.
   ;; TODO Should we create a separate spec for this enriched data?
   ;; TODO flesh out these specs.
   [:http/request {:optional true} :map]
   [:parameter/spec {:optional true} [:vector :any]]
   ;; The generated map of options for the API call is stored on the
   ;; resource map. The map has to conform to the generated parameter
   ;; spec.
   [:parameter/data {:optional true} :map]])

;; Options for (client/init).
(def init-options
  [:map {:closed true}
   [:client/keywordize?
    {:optional true
     :description "Convert response keys to keywords?"}
    :boolean]
   [:client/validate?
    {:optional true
     :description "Validate the parsed response body?"}
    :boolean]
   [:client/timeout
    {:optional true
     :description "Request timeout in milliseconds."}
    :int]
   [:client/node-info?
    {:optional true
     :description "Pre-fetch and store node information."}
    :boolean]
   [:http/client
    {:optional true
     :description "An existing HTTP client to use."}
    ;; TODO tighten this up; satisfies? HttpClient
    :any]
   [:http/scheme
    {:optional true
     :description "The protocol scheme to use to talk to IPFS"
     :example :http}
    spec.http/scheme]
   [:http/host
    {:optional true
     :description "An IP address for the IPFS server"}
    spec.http/host]
   [:http/port
    {:optional true
     :description "A TCP port for the IPFS server"}
    spec.http/port]])

;; Params
;; -----------------------------------------------------------------------------

(def peer-id
  [:and
   {:example "12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"}
   :string])

(def public-key
  [:and
   {:example "CAESIGdvXZHqB6Sbr9gEF9Z1XaWEYNOjC6iW1PFl+jpHE/E4"}
   :string])

(def addresses
  [:and
   {:example
    ["/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip4/127.0.0.1/udp/4001/quic/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip4/192.168.68.105/tcp/4001/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip4/192.168.68.105/udp/4001/quic/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip4/206.248.184.135/tcp/63760/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip4/206.248.184.135/udp/63760/quic/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip6/::1/tcp/4001/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"
     "/ip6/::1/udp/4001/quic/p2p/12D3KooWGn8esyGN8DB1UCsVTZPWxkr6ELGBP9AffLNQqbrfejv7"]}
   :vector])

(def agent-version
  [:and
   {:example "go-ipfs/0.11.0/"}
   :string])

(def protocol-version
  [:and
   {:example "ipfs/0.1.0"}
   :string])

(def protocols
  [:and
   {:example
    ["/ipfs/bitswap"
     "/ipfs/bitswap/1.0.0"
     "/ipfs/bitswap/1.1.0"
     "/ipfs/bitswap/1.2.0"
     "/ipfs/id/1.0.0"
     "/ipfs/id/push/1.0.0"
     "/ipfs/kad/1.0.0"
     "/ipfs/lan/kad/1.0.0"
     "/ipfs/ping/1.0.0"
     "/libp2p/autonat/1.0.0"
     "/libp2p/circuit/relay/0.1.0"
     "/libp2p/circuit/relay/0.2.0/hop"
     "/libp2p/circuit/relay/0.2.0/stop"
     "/p2p/id/delta/1.0.0"
     "/x/"]}
   :vector])

(def key-name
  [:and
   {:example "self"}
   :string])

(def key-id
  [:and
   {:example "k51qzi5uqu5direb9al94reti397oxnp93oeucvf6hkte8nebtj5otqr7d8k6w"}
   :string])

(def key-type
  [:and
   {:example "ed25519"}
   [:enum "rsa" "ed25519"]])

(def key-size
  [:and
   {:example 128}
   :int])

(def ipns-base
  [:and
   {:example "b58mh"}
   [:enum "b58mh" "base36" "base32" "k"]])

(def peerid-base
  [:and
   {:example "base36"}
   [:enum "b58mh" "base36" "base32" "k"]])

(def ipns-name
  [:and
   {:example "k51qzi5uqu5direb9al94reti397oxnp93oeucvf6hkte8nebtj5otqr7d8k6w"}
   :string])

(def ipfs-path
  [:and
   {:example "/ipfs/bafyreid7jv35hibnc3fq2nzacom57gihwfh5e4yp5onoyf2vosybfjf4ua"}
   :string])

(def dag-codec
  [:and
   {:example "dag-cbor"}
   [:enum "dag-cbor" "dag-json"]])

;; TODO flesh this out to conform to DAG-JSON spec, include CIDs
(def dag-json
  [:or
   {:description "DAG-JSON data"
    :example {:foo ["bar" :baz]}}
   vector?
   map?])

;; TODO is there more we can say here?
(def dag-cbor
  [:or
   {:description "CBOR-encoded binary data."}
   spec.http/uint8-array])

(def dag-hash
  [:and
   {:example "sha2-256"}
   [:enum
    ;; This hash is nominally supported but waiting on a bug fix:
    ;; > https://github.com/ipfs/go-ipfs/issues/8650
    ;; TODO enable this option when possible; it's fast!
    ;;"blake3"
    "keccak-256"
    "keccak-512"
    "md5"
    "sha1"
    "sha2-256"
    "sha2-512"
    "sha3-224"
    "sha3-256"
    "sha3-384"
    "sha3-512"
    "shake-128"
    "shake-256"]])

(def content-id
  [:and
   {:description "A multiformat content identifier."
    :example "bagiacgzah24drzou2jlkixpblbgbg6nxfrasoklzttzoht5hixhxz3rlncyq"}
   :string])
