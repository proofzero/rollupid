(ns com.kubelt.ipfs
  "IPFS client."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client])
  (:require
   [com.kubelt.ipfs.v0.dag :as v0.dag]
   [com.kubelt.ipfs.v0.key :as v0.key]
   [com.kubelt.ipfs.v0.name :as v0.name]
   [com.kubelt.ipfs.v0.node :as v0.node]
   [com.kubelt.ipfs.v0.pin :as v0.pin]
   [com.kubelt.ipfs.v0.pin.remote :as v0.pin.remote]
   [com.kubelt.ipfs.v0.pin.remote.service :as v0.pin.remote.service]))

;; TODO namespace client: /api/v0
;; TODO generative testing (malli)
;; TODO body transformer (malli)
;; TODO support keywords as well as string parameters where it makes sense
;; TODO testing!

;; TODO init; create http client (ours!), return system map (integrant? donut power?)
;; TODO execute;
;; - do we have a generic entry point with keyword-based dispatch? multimethod
;; - do we define a function for each call using fn/macro

(def node-v0
  #js {:init ipfs.client/init-js
       :request ipfs.client/request-js

       :dag
       #js {:export v0.dag/export
            :get v0.dag/get
            :import v0.dag/import
            :put v0.dag/put
            :resolve v0.dag/resolve
            :stat v0.dag/stat}

       :key
       #js {:generate v0.key/generate
            :import v0.key/import
            :list v0.key/list
            :rename v0.key/rename
            :rm v0.key/rm}

       :node
       #js {:id v0.node/id}

       :name
       #js {:publish v0.name/publish
            :resolve v0.name/resolve}

       :pin
       #js {:add v0.pin/add
            :ls v0.pin/ls
            :rm v0.pin/rm
            :update v0.pin/update
            :verify v0.pin/verify

            :remote
            #js {:add v0.pin.remote/add
                 :ls v0.pin.remote/ls
                 :rm v0.pin.remote/rm

                 :service
                 #js {:add v0.pin.remote.service/add
                      :ls v0.pin.remote.service/ls
                      :rm v0.pin.remote.service/rm}}}})
