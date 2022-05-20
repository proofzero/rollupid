(ns com.kubelt.spec.openrpc.info.license
  ""
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name]))


(def name
  [:and
   {:description "The license name for the API."}
   :string])

(def url
  [:and
   {:description "A URL to the license used for the API. MUST be in the
format of a URL."}
   :string])

;; License
;; -----------------------------------------------------------------------------

(def license
  [:map
   [:name name]
   [:url {:optional true} url]])
