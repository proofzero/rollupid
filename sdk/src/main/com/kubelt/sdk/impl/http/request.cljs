(ns com.kubelt.sdk.impl.http.request
  "Miscellaneous HTTP request utilties."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Public
;; -----------------------------------------------------------------------------

;; TODO test me
(defn get?
  [m]
  (= :get (:http/method m)))

;; TODO test me
(defn patch?
  [m]
  (= :patch (:http/method m)))

;; TODO test me
(defn post?
  [m]
  (= :post (:http/method m)))

;; TODO test me
(defn put?
  [m]
  (= :put (:http/method m)))

;; TODO test me
(defn delete?
  [m]
  (= :delete (:http/method m)))
