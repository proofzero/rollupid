(ns com.kubelt.spec.core.config.general
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [alias])
  (:require
   [com.kubelt.spec.core.config.security :as security]))

(def alias :string)

(def id
  [:map
   [:alias alias]])

(def media-type
  [:enum "application/json"])

(def client
  [:map
   [:ttl security/ttl]
   [:media-type media-type]])

;; "libp2p://provider_address/rpc"
(def provider :string)

(def aliases
  [:vector
   [:map
    [:alias alias]
    [:provider provider]]])

;; eg: "2022-05-23"
(def version
  [:re "(?:20\\d{2}|20[01][0-9])[-\\/.](?:0[1-9]|1[012])[-\\/.](?:0[1-9]|[12][0-9]|3[01])"])

(def tags
  [:vector [:string]])

(def metadata
  [:map
   [:tags tags]
   [:version version]])
