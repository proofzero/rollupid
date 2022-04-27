(ns com.kubelt.lib.integrant
  "extending ig.core/init and ig.core/build in order to support/realise js/promises
  components before injecting them as dependencies"
  (:require [integrant.core :as ig]
            [cljs.core.async :as async]
            #?(:cljs [cljs.core.async.interop :refer-macros [<p!]])))

(defn relevant-keys [config keys]
  (let [relevant-keys   (#'ig/dependent-keys config keys)
        relevant-config (select-keys config relevant-keys)]
    (when-let [invalid-key (first (#'ig/invalid-composite-keys config))]
      (throw (#'ig/invalid-composite-key-exception config invalid-key)))
    (when-let [ref (first (#'ig/ambiguous-refs relevant-config))]
      (throw (#'ig/ambiguous-key-exception config ref (map key (ig/find-derived config ref)))))
    (when-let [refs (seq (#'ig/missing-refs relevant-config))]
      (throw (#'ig/missing-refs-exception config refs)))
    relevant-keys))

(defn build
  "add extra callback arg"
  ([config keys f assertf resolvef resolve reject]
   {:pre [(map? config)]}
   (try
     (async/go-loop [k-v-seq (map (fn [k] [k (config k)]) (relevant-keys config keys))
                     system (with-meta {} {::ig/origin config})]
       (let [[k v]   (first k-v-seq)
             system' (#'ig/build-key f assertf resolvef system [k v])
             v'      (get system' k)
             v''     #?(:clj v'
                        :cljs (if (= js/Promise (type v')) (<p! v') v'))
             system''  (assoc system' k v'')]
         (if-let [k-v-seq (seq (next k-v-seq))]
           (recur k-v-seq system'')
           (resolve system''))))
     (catch #?(:clj Throwable :cljs :default) t
       (reject #?(:clj (throw t) :cljs (clj->js t)))))))

(defn init
  "add extra callback arg"
  [config resolve reject]
  {:pre [(map? config)]}
  (build config (keys config) ig/init-key #'ig/assert-pre-init-spec ig/resolve-key resolve reject))
