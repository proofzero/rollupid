(ns com.kubelt.spec.openrpc.method
  "A schema for an OpenRPC Method object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods name])
  (:require
   [com.kubelt.spec.openrpc.content :as openrpc.content]
   [com.kubelt.spec.openrpc.error :as openrpc.error]
   [com.kubelt.spec.openrpc.external :as openrpc.external]
   [com.kubelt.spec.openrpc.link :as openrpc.link]
   [com.kubelt.spec.openrpc.pairing :as openrpc.pairing]
   [com.kubelt.spec.openrpc.reference :as openrpc.reference]
   [com.kubelt.spec.openrpc.server :as openrpc.server]
   [com.kubelt.spec.openrpc.tag :as openrpc.tag]))


(def name
  :string)

(def summary
  :string)

(def description
  :string)

(def deprecated
  :boolean)

(def params
  [:vector [:or openrpc.reference/reference openrpc.content/descriptor]])

(def result
  [:or openrpc.reference/reference openrpc.content/descriptor])

(def param-structure
  [:enum "by-name" "by-position" "either"])

;; Method
;; -----------------------------------------------------------------------------

(def method
  [:map
   {:closed true
    :description "Describes the interface for the given method name. The
method name is used as the 'method' field of the JSON-RPC body. It
therefore MUST be unique."}

   [:name
    {:description "The canonical name for the method. The name MUST be
 unique within the methods array."}
    name]

   [:params
    {:description "A list of parameters that are applicable for this
method. The list MUST NOT include duplicated parameters and therefore
require 'name' to be unique. The list can use the Reference object to
link to parameters that are defined by the Content Descriptor
object. All optional params MUST be positioned after all required params
in the list."}
    params]

   [:result
    {:description "The description of the result returned by the
method. It MUST be a Content Descriptor."}
    result]

   [:summary
    {:optional true
     :description "A short summary of what the method does."}
    summary]

   [:description
    {:optional true
     :description "A verbose explanation of the method behaviour."}
    description]

   [:deprecated
    {:optional true
     :description "Declares this method to be deprecated. Consumers
SHOULD refrain from usage of the declared method. Default value is
false."}
    deprecated]

   [:external-docs
    {:optional true
     :description "Additional external documentation for this method."}
    openrpc.external/docs]

   [:tags
    {:optional true
     :description "A list of tags for API documentation control. Tags can
be used for logical grouping of methods by resources or any other
qualifier."}
    openrpc.tag/tags]

   [:servers
    {:optional true
     :description "An alternative 'servers' array to service this
method. If an alternative 'servers' array is specified at the root
level, it will be overridden by this value."}
    openrpc.server/servers]

   [:errors
    {:optional true
     :description "A list of custom application defined errors that MAY
be returned. The errors MUST have unique error codes."}
    openrpc.error/errors]

   [:links
    {:optional true
     :description "A list of possible links from this method call."}
    openrpc.link/links]

   [:param-structure
    {:optional true
     :description "The expected format of the parameters. As per the
JSON-RPC 2.0 specification, the params of a JSON-RPC request object may
be an array, object, or either (represented as 'by-position', 'by-name',
and 'either' respectively). When a method has a 'paramStructure' value
of 'by-name', callers of the method MUST send a JSON-RPC request object
whose 'params' field is an object. Further, the key names of the
'params' object MUST be the same as the 'contentDescriptor.name's for
the given method. Defaults to 'either'."}
    param-structure]

   [:examples
    {:optional true
     :description "Array of Example Pairing object where each example
includes a valid params-to-result Content Descriptor pairing."}
    openrpc.pairing/examples]])

;; [Method]
;; -----------------------------------------------------------------------------

(def methods
  [:vector [:or openrpc.reference/reference method]])
