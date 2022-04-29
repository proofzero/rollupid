(ns com.kubelt.rpc.schema
  "Tools for working with OpenRPC schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [load methods])
  (:require
   [clojure.set :as cset]
   [clojure.string :as cstr]
   [clojure.walk :as walk])
  (:require
   #?@(:clj [[clojure.java.io :as io]]))
  (:require
   [camel-snake-kebab.core :as csk]
   [malli.core :as mc]
   [malli.transform :as mt]
   [com.rpl.specter :as sp])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.spec.openrpc :as spec.openrpc]))

;; TODO consider malli transformers for JSON to edn transformation

(defn version
  [schema]
  {:pre [(map? schema)]}
  (get schema :openrpc))

(defn metadata
  [schema]
  {:pre [(map? schema)]}
  (get schema :info))

(defn servers
  [schema]
  {:pre [(map? schema)]}
  (get schema :servers []))

(defn methods
  "Extract the method descriptions from an Open RPC schema supplied as
  edn. Note that underscores in the method names are used to namespace
  the methods, i.e. a method named foo_getBar will be mapped
  into [:foo :get-bar]."
  [schema]
  {:pre [(map? schema)]}
  (letfn [(extract-method [m]
            (dissoc m :name))
          (s->kw [s]
            (-> s keyword csk/->kebab-case))
          (name->path [s]
            (let [v (cstr/split s #"_")]
              (mapv s->kw v)))
          (f [m method]
            (let [method-name (get method :name)
                  path (name->path method-name)
                  method (extract-method method)]
              (assoc m path method)))]
    (let [methods (get schema :methods [])]
      (reduce f {} methods))))

;; Take a sequence of paths and trim each path be of the given
;; length. Returns a set.
(defn filter-depth
  [paths depth]
  (letfn [(trim-depth [v path]
            ;; If depth is greater than the length of the path, we
            ;; include the path without any further processing.
            (if (> depth (count path))
              (conj v path)
              (let [path (vec (first (partition depth path)))]
                (conj v path))))]
    (reduce trim-depth #{} paths)))

;; Filter a sequence of paths to include only those containing a given
;; search string.
(defn filter-search
  [paths search]
  {:pre [(string? search)]}
  (let [pattern (re-pattern (str ".*" search ".*"))]
    (letfn [(match-kw [kw]
              (re-matches pattern (name kw)))
            (matches? [path]
              (not-empty (filter match-kw path)))
            (match-search [a-set path]
              (if (matches? path)
                (conj a-set path)
                a-set))]
      (reduce match-search #{} paths))))

;; Return only those paths that have the given path prefix. For example,
;; if path contains [:foo :bar], only paths that begin with that
;; sequence of keywords will be returned, e.g. [:foo :bar :baz].
(defn filter-path
  [paths prefix]
  (letfn [(pair= [[a b]]
            (= a b))
          (has-prefix? [prefix path]
            (let [pairs (partition 2 (interleave prefix path))]
              (every? pair= pairs)))
          (match-path [a-set path]
            (if (has-prefix? prefix path)
              (conj a-set path)
              a-set))]
    (reduce match-path #{} paths)))

;; Development
;; -----------------------------------------------------------------------------

(comment
  ;; TODO :params
  (defn params->schema
    [{:keys [params] :as method}]
    (let [params []]
      (-> method
          (assoc :params params)
          (cset/rename-keys {:name :param/name
                             :description :param/description
                             :schema :param/schema}))))

  ;; TODO :result
  (defn extract-method
    [m]
    (-> m
        (dissoc :name)
        (params->schema)
        (cset/rename-keys {:description :method/description
                           :summary :method/summary
                           :params :method/params
                           :result :method/result
                           :examples :method/examples})))
  )

;; Public
;; -----------------------------------------------------------------------------

#?(:clj
   (defn load
     "Load an OpenRPC schema from a file. Validates the OpenRPC schema and
     returns an error map if any issues were detected. Otherwise, returns
     the schema as a map whose keys have been keywordized and converted to
     kebab case."
     [filename]
     (let [json-str (slurp filename)
           keywordize? true
           edn (lib.json/from-json json-str keywordize?)
           tf (mt/transformer mt/strip-extra-keys-transformer
                              mt/string-transformer
                              mt/json-transformer)
           clean-edn (mc/decode spec.openrpc/schema edn tf)]
       (if-not (mc/validate spec.openrpc/schema clean-edn)
         (lib.error/explain spec.openrpc/schema clean-edn)
         clean-edn))))

;; TODO make fn private
#_(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [;; Get all the references used in method parameters.
        param-set (into #{}
                        (sp/select
                         [:methods sp/ALL :params sp/ALL #(get % :$ref) :$ref]
                         schema))
        ;; Get all the references used in method results.
        result-set (into #{}
                         (sp/select
                          [:methods sp/ALL :result :schema #(get % :$ref) :$ref]
                          schema))]
    (cset/union param result)))

;; TODO experiment will query using specter
;; NB probably easiest to use clojure.walk, but specter liable to be useful
;; for more interesting cases later on
#_(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [schema-walker
        (sp/recursive-path
         [k] p
         [(sp/walker k)
          (sp/stay-then-continue
           [(sp/filterer #(not= k (key %)))
            (sp/walker k)
            p])])]
    (sp/select (schema-walker :$ref) {:$ref "xxx" :foo "bar" :biz "baz"})))

(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [inner (fn [x]
                (if (and (map? x) (contains? x :$ref))
                  (do
                    (prn x)
                    (get x :$ref))
                  x))
        outer identity]
    (walk/walk inner outer schema)))

;; TODO make fn private
(defn missing-refs
  "Find all $ref and look them up to confirm that they're provided in the
  schema. Return a vector of just the missing refs."
  [schema]
  (let [ref-set (refs schema)]
    ;; TODO convert each ref path to [keywords]
    ;; TODO look up each ref to confirm that it exists
    ;; TODO return only the missing items
    ))

;; Error checking
;; - check that all referenced ($ref) values exist
(defn validate
  "Check that the schema is well-formed as well as being syntactically
  valid. Returns the unmodified schema if no issues were detected, or an
  error map describing any issues that were found."
  [schema]
  ;; TODO use guards
  (let [missing (missing-refs schema)]
    (if-not (empty? missing)
      (lib.error/error {:message "missing $refs" :missing missing})
      schema)))

;; TODO convert result names to kebab keywords
;; e.g. "hashesPerSecond" -> :hashes-per-second
;; - use original string names *and* kebab keywords
;; TODO replace $ref with the referenced values
;; - method > params
;; - method > result
(defn build
  "Given a provider URL and an OpenRPC schema (converted to edn),
  transform the schema into a client map. The options map is the same as
  that provided to the client init function."
  [url schema options]
  {:pre [(string? url) (map? schema) (map? options)]}
  (let [version (version schema)
        metadata (metadata schema)
        servers (servers schema)
        ;; Generate a map from "path" (a vector of keywords representing
        ;; an available RPC call) to a descriptive map.
        methods (methods schema)]
    {:rpc/version version
     :rpc/metadata metadata
     :rpc/servers servers
     :rpc/methods methods
     :rpc/url url}))
