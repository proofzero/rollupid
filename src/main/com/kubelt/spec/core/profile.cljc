(ns com.kubelt.spec.core.profile
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; These definitions could be Regexed
(def socials [:map
              [:twitter {:optional true} :string]
              [:instagram {:optional true} :string]
              [:linkedin {:optional true} :string]
              [:github {:optional true} :string]])

(def nickname :string)
(def profile-picture :string)
(def email :string)
(def location :string)
(def job :string)
(def website :string)
(def bio :string)

(def schema
  [:map
   [:socials {:optional true} socials]
   [:nickname {:optional true} nickname]
   [:profile-picture profile-picture]
   [:email {:optional true} email]
   [:location {:optional true} location]
   [:job {:optional true} job]
   [:website {:optional true} website]
   [:bio {:optional true} bio]])
