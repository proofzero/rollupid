(ns com.kubelt.cloudflare.kv
  "Operate on CloudFlare KV stores."
  (:require
   [clojure.string :as cstr])
  (:require
   [babashka.fs :as fs]
   [babashka.process :as proc]
   [cheshire.core :as json]))


(def wrangler
  ["npx" "wrangler"])

(defn- arg-config
  [{:keys [config/path]}]
  (cstr/join "=" ["--config" path]))

(defn- arg-env
  [{:keys [env/name]}]
  (when name
    (cstr/join "=" ["--env" name])))

(defn- arg-ns
  [{:keys [namespace/name namespace/id]}]
  (cond
    ;; --namespace-id
    (some? id)
    (cstr/join "=" ["--namespace-id" id])
    ;; --binding
    (some? name)
    (cstr/join "=" ["--binding" name])
    :else
    (throw (ex-info "missing required option" [:namespace/name :namespace/id]))))

;; key-list
;; -----------------------------------------------------------------------------
;; Get a list of keys in a KV store.

(defn key-list
  "Return a set of the keys in a KV store. The options parameter map
  accepts the configuration items:
  - :config/path (required), path to wrangler.toml configuration file
  - :env/name (optional), an environment name
  - :namespace/name OR
    :namespace/id (required), the KV store to operate on"
  [opts]
  (let [args-fn (juxt arg-config arg-env arg-ns)
        args (args-fn opts)
        invoke ["kv:key" "list"]
        command (remove nil? (concat wrangler invoke args))]
    (let [out-raw (-> (proc/process command) proc/check :out slurp)
          out (json/parse-string out-raw)]
      (into #{} (map (fn [x] (get x "name")) out)))))

;; bulk-put
;; -----------------------------------------------------------------------------
;; $ wrangler kv:bulk put --binding= [--env=] [--preview] [--namespace-id=] $FILENAME
;; - --binding [required, if no --namespace-id]: name of namespace to put to
;; - --namespace-id [required, if no --binding]: ID of the namespace to put to
;; - --env $ENV_NAME [optional]: if defined, changes only apply to specified environment
;; - --preview [optional]: interact with preview namespace instead of production
;;     Pass this to use your wrangler.toml file's kv_namespaces.preview_id instead
;;     of kv_namespaces.id
;;
;; This command takes a JSON file as an argument with a list of
;; key-value pairs to upload. An example of JSON input:
;;
;; [
;;   {
;;     "key": "test_key",
;;     "value": "test_value",
;;     "expiration_ttl": 3600
;;   }
;; ]
;;
;; In order to save JSON data, cast value to a string:
;;
;; [
;;   {
;;     "key": "test_key",
;;     "value": "{\"name\": \"test_value\"}",
;;     "expiration_ttl": 3600
;;   }
;; ]
;;
;; The schema below is the full schema for key-value entries uploaded via the bulk API:
;; - key [required]
;;   The key’s name. The name may be 512 bytes maximum. All printable,
;;   non-whitespace characters are valid.
;; - value [required]
;;   The UTF-8 encoded string to be stored, up to 10 MB in length.
;; - expiration [optional]
;;   The time, measured in number of seconds since the UNIX epoch, at
;;   which the key should expire.
;; - expiration_ttl [optional]
;;   The number of seconds the document should exist before
;;   expiring. Must be at least 60 seconds.
;; - base64 [optional]
;;   When true, the server will decode the value as base64 before
;;   storing it. This is useful for writing values that would otherwise
;;   be invalid JSON strings, such as images. Defaults to false.

(defn- write-pairs
  "Given a list of files to be uploaded to CloudFlare KV store (provided
  as a vector of maps), write a file containing that information in the
  format expected by the CloudFlare wrangler utility when performing
  bulk operations on a KV store."
  [file-list {:keys [prefix] :as opts}]
  {:pre [(vector? file-list)
         (every? map? file-list)
         (string? prefix)]}
  (let [tmp_path (str (fs/create-temp-file opts))]
    ;; Write the edn file list as JSON into the temp file.
    (json/generate-stream file-list (clojure.java.io/writer tmp_path))
    ;; Return the path in case the user wants to report it.
    tmp_path))

(defn bulk-put
  "Put a collection of key/value pairs into a KV store.
  - :app/name (optional), an application name
  - :config/path (required), path to wrangler.toml configuration file
  - :env/name (optional), an environment name
  - :namespace/name OR
    :namespace/id (required), the KV store to operate on
  - :output/verbose (optional, default: false), print more information"
  [file-list opts]
  (let [invoke ["kv:bulk" "put"]
        ;; Write the file listing.
        prefix (str (get opts :app/name "babashka") "-")
        args-fn (juxt arg-config arg-env arg-ns)
        args (args-fn opts)
        tmp_path (write-pairs file-list {:prefix prefix})
        command (remove nil? (concat wrangler invoke args [tmp_path]))]
    (when (get opts :output/verbose false)
      (println "generated file list:" tmp_path)
      (println (cstr/join " " command)))
    (-> (proc/process command) proc/check :out slurp)))

;; bulk-delete
;; -----------------------------------------------------------------------------

(defn- write-items
  [items opts]
  {:pre [(set? items) (every? string? items) (map? opts)]}
  (let [data (into [] items)
        prefix (get opts :app/name "cloudflare-")
        tmp_path (str (fs/create-temp-file {:prefix prefix}))]
    (json/generate-stream data (clojure.java.io/writer tmp_path))
    tmp_path))

(defn bulk-delete
  "Delete a set of keys from a KV store. The options parameter map accepts
  the configuration items:
  - :app/name (optional), an application name
  - :config/path (required), path to wrangler.toml configuration file
  - :env/name (optional), an environment name
  - :namespace/name OR
    :namespace/id (required), the KV store to operate on
  - :output/verbose (optional, default: false), print more information"
  [items opts]
  {:pre [(set? items) (map? opts)]}
  (let [;; Construct the CLI arguments we pass to wrangler from the opts
        ;; map.
        args-fn (juxt arg-config arg-env arg-ns)
        args (args-fn opts)
        ;; NB: using --force stops asking for confirmation.
        invoke ["kv:bulk" "delete" "--force"]
        path (write-items items opts)
        command (remove nil? (concat wrangler invoke args [path]))]
    (when (get opts :output/verbose false)
      (println (cstr/join " " command)))
    ;; Returns the string output from wrangler. Should we parse it?
    (-> (proc/process command) proc/check :out slurp)))

;; truncate
;; -----------------------------------------------------------------------------

(defn truncate
  "Remove all the keys in a KV store."
  [opts]
  (let [key-set (key-list opts)]
    (bulk-delete key-set opts)))
