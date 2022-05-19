(ns lib.async-fs-test
  "Test async fs "
  (:require
   [cljs.core.async :refer [go]]
   [com.kubelt.lib.json :as lib.json]
   [cljs.test :as t :refer [deftest is testing async] ]
   [cljs.core.async.interop :refer-macros [<p!]])
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]))


(def ^:dynamic json-path "./fix/openrpc/" #_"./../../../fix/openrpc/")


(deftest fs-async-test
  (testing "reading async existing repo files"
    (async done
           (go
             (try
               (is (= #{:openrpc :info :methods :components}
                      (-> (<p! (.readFile fs-promises (str json-path "ethereum.json")))
                          (lib.json/from-json true)
                          keys
                          set)))
               (catch js/Error err (js/console.log (ex-cause err))))
             (done)))))


(comment
  (t/run-tests)
  ;;
  )
