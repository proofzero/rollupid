(ns com.kubelt.ipfs.client
  "IPFS cross-platform client."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [malli.core :as malli]
   [malli.error :as me])
  (:require
   [com.kubelt.ipfs.api :as ipfs.api]
   [com.kubelt.ipfs.v0.node :as v0.node]
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.proto.http :as proto.http])
  #?(:browser
     (:require
      [com.kubelt.lib.http.browser :as lib.http])
     :node
     (:require
      [com.kubelt.lib.http.node :as lib.http])
     :clj
     (:require
      [com.kubelt.lib.http.jvm :as lib.http])))

;; TODO
;; -----------------------------------------------------------------------------

;; Paper over differences in go-based and JS-based IPFS nodes
;; > It's the key/import endpoint
;; > go-ipfs takes a multipart/form key in the POST body in a variable called 'data'
;; > js-ipfs takes it in the queryparams.
;; > Upshot is that vanilla js-ipfs-http-client can't talk to go-ipfs nodes.

;; params
;; - mutually exclusive parameters

;; CLI
;; - add missing CLI commands for added API calls

;; multiaddr
;; - accept IPFS host address supplied as a multiaddr

;; Strict Mode
;; - add client/init option to en/disable "strict mode"
;; - in strict mode, any API calls marked as :resource/secure? require
;;   requests be sent over :https (possibly unless host is "127.0.0.1").

;; Definitions
;; -----------------------------------------------------------------------------

(def default-scheme
  :http)

(def default-host
  "127.0.0.1")

(def default-port
  5001)

;; Internal
;; -----------------------------------------------------------------------------

;; In order of preference we use: the value supplied for this single
;; call (if any), the value that was specified as the default during
;; client creation (if any), or the default (if all else fails).
(defn- request->scheme
  [client request]
  (or
   (get request :uri/scheme)
   (get client :http/scheme)
   default-scheme))

(defn- request->domain
  [client request]
  (or
   (get request :uri/domain)
   (get client :http/host)
   default-host))

(defn- request->port
  [client request]
  (or
   (get request :uri/port)
   (get client :http/port)
   default-port))

(defn- extract-node-id
  [m]
  (if-let [node-id (get m :id)]
    node-id
    :unknown))

(defn- extract-node-key
  [m]
  (if-let [node-key (get m :public-key)]
    node-key
    :unknown))

(defn- extract-node-type
  [m]
  (if-let [agent-version (get m :agent-version)]
    (let [type-str (first (cstr/split agent-version #"/"))]
      (keyword type-str))
    :unknown))

(defn- extract-node-version
  [m]
  (if-let [agent-version (get m :agent-version)]
    (let [version-str (second (cstr/split agent-version #"/"))
          version-parts (cstr/split version-str #"\.")]
      (zipmap [:major :minor :revision] version-parts))
    :unknown))

;; Parse these multiaddresses.
(defn- extract-node-addresses
  [m]
  (if-let [addresses (get m :addresses)]
    addresses
    :unknown))

(defn- extract-node-protocols
  [m]
  (if-let [protocols (get m :protocols)]
    protocols
    :unknown))

(defn- extract-node-proto-version
  [m]
  (if-let [protocol-version (get m :protocol-version)]
    protocol-version
    :unknown))

;; Public
;; -----------------------------------------------------------------------------

(defn client?
  "Return true if x is an IPFS client returned from calling (init), and
  false otherwise."
  [x]
  (and
   (map? x)
   (= :kubelt.type/ipfs-client (get x :com.kubelt/type))))

(defn error?
  "Return true if x is a Kubelt error map, and false otherwise."
  [x]
  (and
   (map? x)
   (= :kubelt.type/error (get x :com.kubelt/type))))

;; Options: flat (vector list), nested maps
;; with filtering
;; leave out leaf nodes
;; return single descriptor
;;
;; {:cid [:base32 :bases :codecs]
;;  :dag [:export :get :import]}
;; [[:cid :base32]
;;  [:cid :bases]
;;  [:cid :codecs]
;;  [:dag :export]
;;  [:dag :get]
;;  [:dag :import]]
(defn ops
  "Return the collection of oeprations provided by the API. Each vector of
  keywords in the returned collection represents a call that may be
  performed. Use the (doc) command to get a description of the API
  resource."
  ([]
   ;; Return the available API versions.
   [:v0])
  ([version]
   {:pre [(keyword? version)]}
   (condp = version
     :v0 (ipfs.api/paths ipfs.api/v0)
     {}))
  ([version path]
   {:pre [(keyword? version)
          (vector? path) (every? keyword? path)]}
   #_(let [m (api version)]
     (get-in m path)))
  ([version path options]
   {:pre [(keyword? version)
          (vector? path) (every? keyword? path)
          (map? options)]}
   ))

(defn doc
  "Given a vector representing an available API call, return a map that
  describes it."
  [v]
  {:pre [(vector? v)]}
  ;; TODO
  )

;; TODO make initial API call to get node info and cache response
;; - store protocol and agent version (JavaScript, go), etc.
;; - (v0.node/id)
;; - (v0.node/version)
;; - (v0.node/deps)
;; - (v0.cid/hashes)
;; - (v0.cid/codecs)
;; - (v0.cid/bases)
;; Make a sequence of call descriptors and pass to a utility method that
;; makes the requests in parallel, then merges the results for storage
;; in the client map.
;;
;; Note that this means we probably shouldn't allow the endpoint to be
;; overridden per-call; the user should create a new client if they need
;; to call a different host.
;;
;; TODO add timeout option (allow override per call)
;;
;; TODO add connections to standard pinning services (optionally).
;; - pinata
;; - estuary
;; - web3.storage
(defn init
  "Create and return an IPFS client. Accepts an options map that can be
  used to control various aspects of the interaction with a remote IPFS
  daemon or pinning service. Available options include:
  :client/validate? - check that response conforms to expected schema
  :client/keywordize? - make response map keys into idiomatic keywords
  :client/node-info? - fetch and store node information in client
  :client/timeout - request timeout in milliseconds
  :http/client - a pre-created HTTP client (must satisfy HttpClient)
  :http/scheme - the transport scheme to use, e.g. :http, :https
  :http/host - the IP address of the IPFS host
  :http/port - the listening port of the IPFS host"
  ([]
   (init {}))
  ([options]
   (let [default-options {:http/scheme default-scheme
                          :http/host default-host
                          :http/port default-port
                          :client/validate? true
                          :client/keywordize? true}
         options (merge default-options options)]
     ;; Validate the options.
     (if-not (malli/validate ipfs.spec/init-options options)
       (let [explain (-> ipfs.spec/init-options
                         (malli/explain options)
                         me/humanize)]
         {:com.kubelt/type :kubelt.type/error
          :error explain})
       ;; Options are valid, return the client.
       (let [{:keys [http/client]}
             (if (contains? options :http/client)
               (let [http-client (get options :http/client)]
                 {:http/client http-client})
               (let [http-client (lib.http/->HttpClient)]
                 {:http/client http-client}))]
         (if-not (satisfies? proto.http/HttpClient client)
           {:com.kubelt/type :kubelt.type/error
            :error "invalid HTTP client"}
           ;; The final shape of the client map.
           (merge
            {:com.kubelt/type :kubelt.type/ipfs-client
             ;;:client/options options
             :http/client client}
            ;; Fetch and store node information, e.g. node type (Go,
            ;; JavaScript) unless told not to. We use this information
            ;; to paper over differences in the various implementations.
            (merge options
                   (if (get options :client/node-info? true)
                     (let [id-request (-> (v0.node/id) :http/request)
                           ;; Get the HTTP request scheme for the request.
                           request-scheme (request->scheme options id-request)
                           ;; Get the HTTP host for the request.
                           request-domain (request->domain options id-request)
                           ;; Get the HTTP port for the request.
                           request-port (request->port options id-request)
                           ;; We always keywordize and validate this
                           ;; response so we're storing data in known
                           ;; format.
                           id-request (-> id-request
                                          (assoc :uri/scheme request-scheme)
                                          (assoc :uri/domain request-domain)
                                          (assoc :uri/port request-port)
                                          (assoc :response/keywordize? true))
                           ;; TODO validate response
                           info (proto.http/request-sync client id-request)
                           ;; Extract some information from the response and
                           ;; store directly in the client. Some of these are
                           ;; the criteria along which we expect node behaviour
                           ;; to vary.
                           node-id (extract-node-id info)
                           node-key (extract-node-key info)
                           node-type (extract-node-type info)
                           node-version (extract-node-version info)
                           node-addresses (extract-node-addresses info)
                           node-proto-version (extract-node-proto-version info)
                           node-protocols (extract-node-protocols info)]
                       {:ipfs.node/id node-id
                        :ipfs.node/key node-key
                        :ipfs.node/type node-type
                        :ipfs.node/version node-version
                        :ipfs.node/protocol node-proto-version
                        :ipfs.node/addresses node-addresses
                        :ipfs.node/protocols node-protocols})
                     {})))))))))

#?(:cljs
   (defn init-js
     [options-obj]
     (let [options (js->clj options-obj :keywordize true)]
       (init options))))

(defn request
  "Perform an IPFS request using the supplied client instance. The request
  map describes the API call to perform and should be created using an
  API resource function (currently, one of the functions under
  com.kubelt.ipfs.v0). The functions accept a map of options for the API
  call, as well as additional client-specific options that modify how
  the request is performed. The options are validated, and an error map
  is returned if any problems are found, e.g. a required parameter for
  the call that is missing.

  In addition to the call-specific parameters, the additional options
  that can be used include:
  :http/method - override the HTTP request method
  :http/scheme - override the HTTP request scheme
  :http/host - override the IPFS daemon host
  :http/port - override the IPFS daemon port
  :client/validate? - perform validation of the response
  :client/keywordize? - convert response data into idiomatic maps
  :client/timeout - request timeout in milliseconds

  Notably, you can provide callbacks to handle the response or any
  errors that might occur:
  :on/response - a function to invoke with processed response data
  :on/error - a function to invoke when an error occurs

  By default, without supplying any callbacks, you'll receive a
  future (in Clojure) or a promise (in ClojureScript) that resolves to
  the result of the request."
  [client request-map]
  (cond
    ;; Validate that we've been given a IPFS client to make a call with.
    (not (client? client))
    {:com.kubelt/type :kubelt.type/error
     :error "invalid client"}
    ;; If user doesn't check the resource map to see that no error
    ;; occurred, we'll catch it here.
    (error? request-map)
    request-map
    ;; Validate request-map.
    (not (malli/validate ipfs.spec/api-resource request-map))
    (let [explain (-> ipfs.spec/api-resource
                      (malli/explain request-map)
                      me/humanize)]
      {:com.kubelt/type :kubelt.type/error
       :error explain})
    ;; Perform the request!
    :else
    (let [;; TODO allow per-request override of keywordizing?
          keywordize? (get client :client/keywordize? true)
          ;; TODO perform validation if asked for.
          ;; TODO allow per-request override of validation?
          validate? (get client :client/validate? false)
          ;; This stored map contains the HTTP request parameters we can
          ;; pass to our HTTP client (once we've added a few missing
          ;; bits).
          request (get request-map :http/request)
          ;; Get the HTTP request scheme for the request.
          request-scheme (request->scheme client request)
          ;; Get the HTTP host for the request.
          request-domain (request->domain client request)
          ;; Get the HTTP port for the request.
          request-port (request->port client request)
          ;; Add the request target details to the request map, along
          ;; with any additional parameters that control how the result
          ;; will be performed and/or the response processed.
          request (-> request
                      (assoc :uri/scheme request-scheme)
                      (assoc :uri/domain request-domain)
                      (assoc :uri/port request-port)
                      ;; Should response body be keywordized?
                      (assoc :response/keywordize? keywordize?)
                      ;; Should response body be validated?
                      (assoc :response/validate? validate?))
          ;; TODO invoke callbacks if provided
          ;; TODO supply promise/channel if requested
          http-client (get client :http/client)
          ;; By default perform synchronous request.
          response (proto.http/request-sync http-client request)]

      ;; TODO promise, channel
      ;; TODO callback fns:
      ;; - :on/response (fn [x] )
      #_on-response #_(fn [x]
                        (prn x))
      ;; - :on/error (fn [x] )
      ;; TODO parse response body
      ;; TODO validate response body, cf. :client/validate?
      ;; TODO transform response body, cf. :client/keywordize?
      ;;@(proto.http/request-sync http-client request on-response)

      (if-let [body-fn (get request-map :response/body-fn)]
          (body-fn request-map response)
          response))))

#?(:cljs
   (defn request-js
     [client request]
     (request client request)))
