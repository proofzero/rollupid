(ns com.kubelt.spec.core.config
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require [com.kubelt.spec.core.config.general :as general]
            [com.kubelt.spec.core.config.security :as security]))

(def general-config
  [:map
   [:id {:optional false} general/id]
   [:client {:optional false} general/client]
   [:aliases {:optional false} general/aliases]
   [:metadata {:optional false} general/metadata]])

(def security-config
  [:map
   [:auth {:optional false} security/auth]
   [:signers {:optional false} security/signers]
   [:roles {:optional false} security/roles]
   [:policies {:optional false} security/policies]
   [:capabilities {:optional false} security/capabilities]])

(def config
  [:map
   [:general general-config]
   [:security security-config]])
