(ns com.kubelt.lib.integrant
  "extending ig.core/init and ig.core/build in order to support/realise js/promises
  components before injecting them as dependencies"
  (:require [integrant.core :as ig]
            [cljs.core.async :as async]
            #?(:cljs [cljs.core.async.interop :refer-macros [<p!]])
            #?(:cljs [com.kubelt.lib.promise :as promise])))

(defn build
  "add extra callback arg"
  ([config resolve reject keys f assertf resolvef]
   {:pre [(map? config)]}
   (try
     (let [relevant-keys   (#'ig/dependent-keys config keys)
           relevant-config (select-keys config relevant-keys)]
       (when-let [invalid-key (first (#'ig/invalid-composite-keys config))]
         (throw (#'ig/invalid-composite-key-exception config invalid-key)))
       (when-let [ref (first (#'ig/ambiguous-refs relevant-config))]
         (throw (#'ig/ambiguous-key-exception config ref (map key (ig/find-derived config ref)))))
       (when-let [refs (seq (#'ig/missing-refs relevant-config))]
         (throw (#'ig/missing-refs-exception config refs)))
       (async/go-loop [k-v-seq (map (fn [k] [k (config k)]) relevant-keys)
                       system (with-meta {} {:integrant.core/origin config})]
         (let [[k v] (first k-v-seq)
               v' (#'ig/expand-key system resolvef v)
               _ (assertf system k v')
               system (-> system
                          (assoc k (let [res (#'ig/try-build-action system f k v')]
                                     #?(:clj res
                                        :cljs (if (promise/promise? res)
                                                (<p! res)
                                                res))))
                          (vary-meta assoc-in [::build k] v'))]
           (if-let [k-v-seq (seq (next k-v-seq))]
             (recur k-v-seq system)
             (resolve system)))))
     (catch #?(:clj Throwable :cljs :default) t
       (reject #?(:clj (throw t) :cljs (clj->js t)))))))

(defn init
  "add extra callback arg"
  [config resolve reject]
  {:pre [(map? config)]}
  (build config resolve reject (keys config) ig/init-key #'ig/assert-pre-init-spec ig/resolve-key))
