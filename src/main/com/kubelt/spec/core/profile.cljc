(ns com.kubelt.spec.core.profile
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; These definitions could be Regexed
(def socials [:map
              [:twitter :string]
              [:instagram :string]
              [:linkedin :string]
              [:github :string]])

(def nickname :string)
(def profile-picture :string)
(def email :string)
(def location :string)
(def job :string)
(def website :string)
(def bio :string)

(def profile-config
  [:map
   [:socials socials]
   [:nickname nickname]
   [:profile-picture profile-picture]
   [:email email]
   [:location location]
   [:job job]
   [:website website]
   [:bio bio]])
