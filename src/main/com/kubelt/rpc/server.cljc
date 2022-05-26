(ns com.kubelt.rpc.server
  "Work with OpenRPC Server objects."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.uri :as lib.uri]
   [malli.core :as malli])
  (:require
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
  supplied as a template, in which case there may be variables supplied
  in the :variables map that may be used to interpolate those variables
  when producing the URI."
  [m]
  {:pre [(server? m)]}
  ;; TODO be sure we support relative URLs; a server map :uri might be
  ;; defined w.r.t. a base URL rather than being absolute. (lib.uri/join)?
  (let [template (get m :uri)
        variables (get m :variables)]
    ;; TODO this currently just returns the template unmodified
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
