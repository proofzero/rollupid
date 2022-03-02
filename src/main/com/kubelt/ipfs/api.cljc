(ns com.kubelt.ipfs.api
  "Declarative map of available API surface."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.walk :as walk])
  (:require
   [com.kubelt.ipfs.v0.cid :as v0.cid]
   [com.kubelt.ipfs.v0.dag :as v0.dag]
   [com.kubelt.ipfs.v0.key :as v0.key]
   [com.kubelt.ipfs.v0.name :as v0.name]
   [com.kubelt.ipfs.v0.node :as v0.node]
   [com.kubelt.ipfs.v0.pin :as v0.pin]
   [com.kubelt.ipfs.v0.pin.remote :as v0.pin.remote]
   [com.kubelt.ipfs.v0.pin.remote.service :as v0.pin.remote.service]
   [com.kubelt.ipfs.v0.stats :as v0.stats]
   [com.kubelt.ipfs.v0.swarm :as v0.swarm]
   [com.kubelt.ipfs.v0.swarm.address :as v0.swarm.address]
   [com.kubelt.ipfs.v0.swarm.filter :as v0.swarm.filter]
   [com.kubelt.ipfs.v0.swarm.peering :as v0.swarm.peering]))


(def v0
  "A map of the supported API."
  {:cid {:base32 v0.cid/base32-desc
         :bases v0.cid/bases-desc
         :codecs v0.cid/codecs-desc
         :format v0.cid/format-desc
         :hashes v0.cid/hashes-desc}
   :dag {:export v0.dag/export-desc
         :get v0.dag/get-desc
         :import v0.dag/import-desc
         :put v0.dag/put-desc
         :resolve v0.dag/resolve-desc
         :stat v0.dag/stat-desc}
   :key {:generate v0.key/generate-desc
         :import v0.key/import-desc
         :list v0.key/list-desc
         :rename v0.key/rename-desc
         :rm v0.key/rm-desc}
   :name {:publish v0.name/publish-desc
          :resolve v0.name/resolve-desc}
   :node {:id v0.node/id-desc
          :ping v0.node/ping-desc
          :version v0.node/version-desc
          :deps v0.node/deps-desc}
   :pin {:add v0.pin/add-desc
         :ls v0.pin/ls-desc
         :rm v0.pin/rm-desc
         :update v0.pin/update-desc
         :verify v0.pin/verify-desc
         :remote {:add v0.pin.remote/add-desc
                  :ls v0.pin.remote/ls-desc
                  :rm v0.pin.remote/rm-desc
                  :service {:add v0.pin.remote.service/add-desc
                            :ls v0.pin.remote.service/ls-desc
                            :rm v0.pin.remote.service/rm-desc}}}
   :stats {:bitswap v0.stats/bitswap-desc
           :bw v0.stats/bw-desc
           :dht v0.stats/dht-desc
           :provide v0.stats/provide-desc
           :repo v0.stats/repo-desc}
   :swarm {:addrs [v0.swarm/addrs-desc
                   {:listen v0.swarm.address/listen-desc
                    :local v0.swarm.address/local-desc}]
           :connect v0.swarm/connect-desc
           :disconnect v0.swarm/disconnect-desc
           :filters [v0.swarm/filters-desc
                     {:add v0.swarm.filter/add-desc
                      :rm v0.swarm.filter/rm-desc}]
           :peering {:add v0.swarm.peering/add-desc
                     :ls v0.swarm.peering/ls-desc
                     :rm v0.swarm.peering/rm-desc}
           :peers v0.swarm/peers-desc}})

;; Public
;; -----------------------------------------------------------------------------

(defn paths
  "Given an API map, return the valid paths that can be requested."
  [m]
  (letfn [(f [x]
            (cond
              (keyword? x) x
              (vector? x) x
              (map? x)
              (if (= :kubelt.type/api-resource (get x :com.kubelt/type))
                nil
                x)))]
    (walk/postwalk f m)))
