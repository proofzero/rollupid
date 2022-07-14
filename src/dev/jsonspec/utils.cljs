(ns jsonspec.utils
  (:require
   [malli.json-schema :as json-schema]
   [malli.generator :as mg]
   [com.kubelt.spec.profile :as spec.profile]
   [com.kubelt.lib.io.node :as io]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.json :as json]))


(def local-path "/Users/tangrammer/git/kubelt/kubelt/")

(defn json-spec-path [filename]
  (str local-path "src/main/com/kubelt/jsonspec/" filename ".json"))

(comment

 (-> (io/write-to-file& (json/edn->json-forjs-str (json-schema/transform spec.profile/profile))
                        (json-spec-path "Profile") )
     (lib.promise/then  (fn [x] (println "done!" x)))
     (lib.promise/catch  (fn [e] (println "error! " e)))
     )
;;
 )
