(ns com.kubelt.spec.openrpc.server
  "A schema for an OpenRPC Server object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name])
  (:require
   [com.kubelt.spec.openrpc.runtime :as openrpc.runtime]
   [com.kubelt.spec.openrpc.server.variable :as openrpc.server.variable]))


(def name
  :string)

(def url
  openrpc.runtime/expression)

(def summary
  :string)

(def description
  :string)

;; Server
;; -----------------------------------------------------------------------------

(def server
  [:map
   {:closed true
    :description "An object representing a Server."}

   [:name
    {:description "A name to be used as the canonical name for the
server."}
    name]

   [:url
    {:description "A URL to the target host. This URL supports Server
Variables and MAY be relative, to indicate that the host location is
relative to the location where the OpenRPC document is being
served. Server Variables are passed into the Runtime Expression to
produce a server URL."}
    url]

   [:summary
    {:optional true
     :description "A short summary of what the server is."}
    summary]

   [:description
    {:optional true
     :description "A description of the host described by the URL."}
    description]

   [:variables
    {:optional true
     :description "A map between a variable name and its value. The
value is passed into the Runtime Expression to produce a server URL."}
    openrpc.server.variable/variables]])

;; [Server]
;; -----------------------------------------------------------------------------

(def servers
  [:vector server])
