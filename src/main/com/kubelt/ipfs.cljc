(ns com.kubelt.ipfs
  "IPFS client."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"})

;; TODO namespace client: /api/v0
;; TODO generative testing (malli)
;; TODO body transformer (malli)
;; TODO support keywords as well as string parameters where it makes sense
;; TODO testing!

;; TODO init; create http client (ours!), return system map (integrant? donut power?)
;; TODO execute;
;; - do we have a generic entry point with keyword-based dispatch? multimethod
;; - do we define a function for each call using fn/macro
