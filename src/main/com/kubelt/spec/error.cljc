(ns com.kubelt.spec.error
  "Definition of declarative error maps."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; error
;; -----------------------------------------------------------------------------
;; TODO flesh out error map definition

(def error
  [:map
   [:kubelt/type [:enum :kubelt.type/error]]])

(def error-schema
  [:and
   {:name "error"
    :description "An error map"
    :example {}}
   error])

;; conform*
;; -----------------------------------------------------------------------------

(def guard
  [:tuple :vector :any])

(def guards
  [:+ guard])

(def body
  :any)
