(ns com.kubelt.spec.openrpc.info.contact
  ""
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name]))


(def name
  [:and
   {:description "The identifying name of the contact
person/organization."}
   :string])

(def url
  [:and
   {:description "The URL pointing to the contact information. MUST be
in the format of a URL."}
   :string])

(def email
  [:and
   {:description "The e-mail address of the contact
person/organization. MUST be in the format of an e-mail address."}
   :string])

;; Contact
;; -----------------------------------------------------------------------------

(def contact
  [:map
   [:name {:optional true} name]
   [:url {:optional true} url]
   [:email {:optional true} email]])
