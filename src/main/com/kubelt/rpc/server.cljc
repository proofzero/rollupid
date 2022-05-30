(ns com.kubelt.rpc.server
  "Work with OpenRPC Server objects."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.uri :as lib.uri]
   ;;[com.kubelt.rpc.client :as rpc.client]
   [com.kubelt.spec.openrpc.server :as spec.openrpc.server]))

;; server?
;; -----------------------------------------------------------------------------

(defn server?
  "Returns true if the given value has the shape of an OpenRPC server
  configuration map, and false otherwise."
  [x]
  (malli/validate spec.openrpc.server/server x))

;; uri
;; -----------------------------------------------------------------------------

(defn uri
  "Convert an OpenRPC server map into a URL. Note that the URL may be
  supplied as a template, in which case there may be values supplied
  in the :variables map that may be used to interpolate those variables
  when producing the URI."
  [m]
  {:pre [(server? m)]}
  ;; TODO be sure we support relative URLs; a server map :uri might be
  ;; defined w.r.t. a base URL rather than being absolute. (lib.uri/join)?
  (let [template (get m :uri)
        variables (get m :variables)]
    ;; TODO this currently just returns the template unmodified. If no
    ;; variables are present in the server map (we pass nil as the
    ;; variables argument to (expand)), this should return the template
    ;; unchanged.
    (lib.uri/expand template variables)))

;; uri-map
;; -----------------------------------------------------------------------------

(defn uri-map
  "Given an OpenRPC server map, generate the URL it represents and return
  a map of URI components."
  [m]
  {:pre [(server? m)]}
  (let [server-url (uri m)]
    (lib.uri/parse server-url)))

;; select
;; -----------------------------------------------------------------------------

(defn select
  "Return a server configuration map from the client. The path is used to
  select one of the available schemas within the client. If the options
  map contains the :server/name key, that name is used to select the
  corresponding server configuration from within the schema. If no
  server name is provided, and only one server is available, that is
  returned. If no servers are configured, an error is returned."
  ([client path]
   (let [defaults {}]
     (select client path defaults)))

  ([client path options]
   (let [;; TODO fix me; this introduces a cyclic dependency. Move into
         ;; shared .method namespace and use from both client and this
         ;; namespace?
         ;;method (rpc.client/find-method client path)
         ]
     ;; TODO use the path to select one of the available schemas.
     ;; TODO use the :server/name value to select one of the servers from the schema
     ;; TODO use the :server/random? flag to return an available server at random
     ;; TODO otherwise return only available server
     ;; TODO otherwise return an error (no servers available)
     ;;method
     )))
