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
  (mu/optional-keys [:map
                     [:nickname :string]
                     [:profilePicture profilePicture]
                     [:email :string]
                     [:location :string]
                     [:job :string]
                     [:website :string]
                     [:bio :string]
                     [:socials socials]]))
