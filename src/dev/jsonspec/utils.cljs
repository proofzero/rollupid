(ns jsonspec.utils
  (:require
   [malli.json-schema :as json-schema]
   [com.kubelt.spec.profile :as spec.profile]
   [com.kubelt.lib.io.node :as io]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.json :as json]
   [clojure.string :as str])
  (:require
   ["process" :as process]
   ["json-schema-to-typescript" :refer [compileFromFile]]))

(def local-path (str/replace (.cwd process) "packages/sdk-js/lib" ""))

(defn json-spec-path [filename]
  (str local-path "src/main/com/kubelt/jsonspec/" filename ".json"))

(defn ts-types-path [filename]
  (str local-path "three-id/src/types/" filename ".d.ts"))

(defn generate-ts-type& [malli-spec type-name]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (io/write-to-file&
          (json-spec-path type-name)
          (.stringify js/JSON (clj->js (json-schema/transform malli-spec)) nil 2))
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
         (lib.promise/catch  (fn [e] (reject (str "[ERROR] " e))))))))


(defn generate-all& [col]
  (->>
   col
   (mapv (fn [[malli-spec ts-name]]
           (generate-ts-type& malli-spec ts-name)))
   (lib.promise/all)))

(comment
  (-> (generate-all& [[spec.profile/profile "Profile"]])
      (lib.promise/then #(println "YIKES! .... " %))
      (lib.promise/catch #(println "ERROR!.... " %)))

;;
  )
