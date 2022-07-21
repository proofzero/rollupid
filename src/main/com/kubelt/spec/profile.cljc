(ns com.kubelt.spec.profile
  "Schema for PFP."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.util :as mu]))

(def profilePicture [:map
                     [:collectionTokenId {:optional false} :string]
                     [:collectionId {:optional true} :string]
                     [:name {:optional false} :string]
                     [:imageUrl {:optional false} :string]])

(def socials (mu/optional-keys
              [:map
               [:twitter :string]
               [:instagram :string]
               [:linkedin :string]
               [:github :string]]))

(def profile
  (mu/optional-keys
   [:map {:registry {:profile/socials socials
                     :profile/profilePicture profilePicture}}
    [:nickname :string]
    [:bio :string]
    [:job :string]
    [:location :string]
    [:website :string]
    [:email :string]
    :profile/profilePicture
    :profile/socials]))
