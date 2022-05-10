(ns malli.json-schema.example
  (:require [clojure.walk :refer (keywordize-keys)]
            [malli.core :as m]
            [malli.error :as me]
            [malli.json-schema.parse :as p]))

(def data {"$id" "https://example.com/person.schema.json",
           "$schema" "https://json-schema.org/draft/2020-12/schema",
           "title" "Person",
           "type" "object",
           "properties"
           {"firstName"
            {"type" "string", "description" "The person's first name."},
            "lastName"
            {"type" "string", "description" "The person's last name.", "required" true},
            "age"
            {"description"
             "Age in years which must be equal to or greater than zero.",
             "type" "integer",
             "minimum" 0}}})

(def my-schema (p/schema->malli (keywordize-keys data)))
(m/schema? my-schema)
(m/form my-schema)
;; =>
[:map
 {:title "Person"}
 [:firstName
  {:optional true}
  [:string {:description "The person's first name."}]]
 [:lastName
  {:required true}
  [:string {:description "The person's last name."}]]
 [:age
  {:optional true}
  [int?
   {:description
    "Age in years which must be equal to or greater than zero."}]]]


(m/validate my-schema (keywordize-keys {"firstName" "John", "lastNayme" "Doe", "age" 21}))
(-> (m/explain my-schema (keywordize-keys {"firstName" "John", "lastNayme" "Doe", "age" 21}))
    (me/humanize))
;;=>
{:lastName ["missing required key"]}


(m/validate my-schema (keywordize-keys {"firstName" "John", "lastName" "Doe", "age" 21}))
;; => true
