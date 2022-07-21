(ns jsonspec.utils
  (:require
   [malli.json-schema :as json-schema]
   [com.kubelt.spec.jwt :as spec.jwt]
   [com.kubelt.spec.vault :as spec.vault]
   [com.kubelt.spec.profile :as spec.profile]
   [com.kubelt.spec.config :as spec.config]
   [com.kubelt.lib.io.node :as io]
   [com.kubelt.lib.promise :as lib.promise]
   [clojure.string :as str])
  (:require
   ["process" :as process]
   ["json-schema-to-typescript" :refer [compileFromFile]]))


(def local-path (str/replace (.cwd process) "packages/sdk-js/lib" ""))

(defn json-spec-path [filename]
  (str local-path "target/jsonspec/" filename ".json"))

(defn ts-types-path [filename]
  (str local-path "three-id/src/types/" filename ".d.ts"))

(defn generate-ts-type& [malli-spec type-name]
  (lib.promise/promise
   (fn [resolve reject]
     (let [json-data (-> (with-redefs
                           ;; this solve the fully keyword registry problem
                           ;; malli only supports strings https://github.com/metosin/malli/blob/2398df55ee806e25592fabf4d0c642ee3a2b233f/test/malli/json_schema_test.cljc#L200
                          [json-schema/-ref
                           (fn [x]
                             {:$ref (str "#/definitions/" (if (keyword? x)
                                                            (name x) #_(.substring (str x) 1)
                                                            x))})]
                           (json-schema/transform malli-spec))
                         (update  :definitions #(reduce (fn [m [x v]]
                                                          (assoc m (name x) v)) {} %)))]

       (-> (io/write-to-file&
            (json-spec-path type-name)
            (.stringify js/JSON
                        (clj->js json-data
                                 {:keyword-fn #(.substring (str %) 1)})
                        nil 2))
           (lib.promise/then
            (fn [_]
              (-> (compileFromFile (json-spec-path type-name)
                                   (clj->js {"additionalProperties" false
                                             "bannerComment" ""
                                             "unknownAny" false}))
                  (lib.promise/then  (fn [x]
                                       (io/write-to-file&
                                        (ts-types-path type-name)
                                        x)))
                  (lib.promise/then  (fn [_] (resolve (str "[SUCCESS] " type-name))))
                  (lib.promise/catch (fn [e] (reject (str "[ERROR] " e)))))))
           (lib.promise/catch  (fn [e] (reject (str "[ERROR] " e)))))))))


(defn generate-all& [col]
  (->>
   col
   (mapv (fn [[malli-spec ts-name]]
           (generate-ts-type& malli-spec ts-name)))
   (lib.promise/all)))

(comment

  (-> (generate-all& [[spec.profile/profile "Profile"]
                      [spec.config/optional-sdk-config "OptionalConfig"]
                      [spec.vault/vault-tokens* "VaultToken"]
                      [spec.jwt/jwt "JWT"]])
      (lib.promise/then #(println "OK! .... " %))
      (lib.promise/catch #(println "ERROR!.... " %)))

;;
  )
