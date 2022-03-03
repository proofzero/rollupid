(ns com.kubelt.spec.error
  "Definition of declarative error maps."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

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
