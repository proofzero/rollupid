(ns com.kubelt.cloudflare.client
  "Client for Cloudflare API.")

;; Documentation:
;;   https://api.cloudflare.com/

;; The API is accessed by making HTTPS requests to a specific version
;; endpoint URL, in which GET, POST, PUT, PATCH, and DELETE methods
;; dictate how your interact with the information available. Every
;; endpoint is accessed only via the SSL-enabled HTTPS (port 443)
;; protocol.
;;
;; Everything (methods, parameters, etc.) is fixed to a version number,
;; and every call must contain one. The latest version is Version 4.
;;
;; The stable base URL for all Version 4 HTTPS endpoints is:

(def base-url
  "https://api.cloudflare.com/client/v4/")

;; Requests

;; Requests must be sent over HTTPS with any payload formatted in
;; JSON. Depending on if a request is authenticated with the new API
;; Tokens or the old API Keys, required headers differ and are detailed
;; below.

;; API Tokens

;; API Tokens provide a new way to authenticate with the Cloudflare
;; API. They allow for scoped and permissioned access to resources and
;; use the RFC compliant Authorization Bearer Token Header.

;; API Keys (not supported)


;; Pagination

;; Depending on your request, the results returned may be limited. You
;; can page through the returned results with the following query
;; parameters:
;;
;; Name	Type	Description
;; page	        integer	Which page of results to return
;; per_page	integer	How many results to return per page
;; order	string	Attribute name to order the responses by
;; direction	string	Either ASC or DESC

;; init
;; -----------------------------------------------------------------------------

(defn init
  "Initialize the client."
  [token]
  {:pre [(string? token)]}
  {:cloudflare.api/token token
   :cloudflare.api/timeout 5000
   :cloudflare.api/url base-url})
