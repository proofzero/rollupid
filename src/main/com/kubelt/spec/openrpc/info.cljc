(ns com.kubelt.spec.openrpc.info
  "Define the schema for an OpenRPC Info object that provides metadata
  about an API."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.openrpc.info.contact :as info.contact]
   [com.kubelt.spec.openrpc.info.license :as info.license]))


(def version
  :string)

(def title
  :string)

(def description
  :string)

(def terms
  :string)

;; Info
;; -----------------------------------------------------------------------------

(def info
  [:map
   {:closed true}

   [:version
    {:description "The version of the OpenRPC document (which is
distinct from the OpenRPC Specification version or the API
implementation version."}
    version]

   [:title
    {:description "The title of the application."}
    title]

   [:description
    {:optional true
     :description "A verbose description of the application."}
    description]

   [:terms-of-service
    {:optional true
     :description "A URL to the Terms of Service for the API. MUST be in
the format of a URL."}
    terms]

   [:contact
    {:optional true}
    info.contact/contact]

   [:license
    {:optional true}
    info.license/license]])
