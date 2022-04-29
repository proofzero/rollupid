(ns com.kubelt.spec.openrpc
  "A schema for OpenRPC documents. We use it to validate a schema provided
  to initialize an RPC client."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.openrpc.method :as openrpc.method]
   [com.kubelt.spec.openrpc.server :as openrpc.server]
   [com.kubelt.spec.openrpc.component :as openrpc.component]
   [com.kubelt.spec.openrpc.info :as openrpc.info]
   [com.kubelt.spec.openrpc.external :as openrpc.external]))


(def version
  :string)

;; Root
;; -----------------------------------------------------------------------------

(def schema
  [:map
   {:closed true
    :description "The root object of an OpenRPC document."}

   [:openrpc
    {:description "This string MUST be the semantic version number of
the OpenRPC Specification version that the OpenRPC document uses. This
field SHOULD be used by tooling specifications and clients to interpret
the OpenRPC document. This is *not* related to the API info.version
string."}
    version]

   [:info
    {:description "Provides metadata about the API. The metadata MAY be
used by tooling as required."}
    openrpc.info/info]

   [:methods
    {:description "The available methods for the API. While it is
required, the array may be empty (to handle security filtering, for
example)."}
    openrpc.method/methods]

   [:components
    {:optional true
     :description "Holds a set of reusable objects for different aspects
of the OpenRPC spec. All objects defined within the components object
will have no effect on the API unless they are explicitly referenced
from properties outside the components object."}
    openrpc.component/components]

   [:servers
    {:optional true
     :description "An array of Server objects, which provide connectivity
information to a target server. If the servers property is not provided,
or is an empty array, the default value would be a Server Object with a
url value of 'localhost'."}
    openrpc.server/servers]

   [:external-docs
    {:optional true}
    openrpc.external/docs]])
