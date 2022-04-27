(ns com.kubelt.lib.vault
  "Work with a 'vault' that stores session tokens."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"})

;; Public
;; -----------------------------------------------------------------------------

(defn vault?
  [x]
  (and
   (map? x)
   (= :kubelt.type/vault (:com.kubelt/type x))))

(defn vault
  "Return a token storage vault containing a map from core name to
  associated JWT."
  ([]
   (let [tokens {}]
     (vault tokens)))
  ([token-map]
   {:pre [(map? token-map)]}
   {:com.kubelt/type :kubelt.type/vault
    :vault/tokens token-map}))

(defn tokens
  "Return a map from core name to JWT token strings."
  [vault]
  {:pre [(vault? vault)]}
  (letfn [(token-for [m [core decoded-jwt]]
            ;; The original JWT string parts are preserved as :token
            ;; and :signature when decoding a JWT
            ;; using (lib.jwt/decode). We just stitch those pieces back
            ;; together to get the original JWT.
            (let [token (:token decoded-jwt)
                  signature (:signature decoded-jwt)
                  jwt-str (str token "." signature)]
              (assoc m core jwt-str)))]
    (let [token-map (:vault/tokens vault)]
      (reduce token-for {} token-map))))
