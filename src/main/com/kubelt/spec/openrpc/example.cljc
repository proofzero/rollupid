(ns com.kubelt.spec.openrpc.example
  "Describes an OpenRPC Example object that is intended to match a Content
  Descriptor schema."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name]))


(def name
  :string)

(def summary
  :string)

(def description
  :string)

(def value
  :any)

(def external-value
  :string)

;; Example
;; -----------------------------------------------------------------------------

(def example
  [:map
   {:closed true
    :description "Defines an example that is intended to match a Content
Descriptor Schema. If the the Content Descriptor Schema includes
'examples', the value from *this* Example object supercedes the value of
the schema example."}

   [:name
    {:optional true
     :description "Canonical name of the example."}
    name]

   [:summary
    {:optional true
     :description "Short description for the example."}
    summary]

   [:description
    {:optional true
     :description "A verbose explanation of the example."}
    description]

   [:value
    {:optional true
     :description "Embedded literal example. The 'value' field and
'externalValue' field are mutually exclusive. To represent examples of
media types that cannot naturally be represented in JSON, use a string
value to contain the example, escaping where necessary."}
    value]

   [:external-value
    {:optional true
     :description "A URL that points to the literal example. This
provides the capability to reference examples that cannot easily be
included in JSON documents. The 'value' and 'externalValue' fields are
mutually exclusive."}
    external-value]])
