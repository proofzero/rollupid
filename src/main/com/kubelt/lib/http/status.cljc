(ns com.kubelt.lib.http.status
  "HTTP status codes and utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.set]))

;; Information
;; -----------------------------------------------------------------------------

(def continue 100)
(def switching-protocols 101)
(def processing 102)
(def early-hints 103)

(def information
  #{continue
    switching-protocols
    processing
    early-hints})

(defn information?
  [status-code]
  (contains? information status-code))

;; Success
;; -----------------------------------------------------------------------------

(def ok 200)
(def created 201)
(def accepted 202)
(def non-authoritative 203)
(def no-content 204)
(def reset-content 205)
(def partial-content 206)
(def multi-status 207)
(def already-reported 208)
(def im-used 209)

(def success
  #{ok
    created
    accepted
    non-authoritative
    no-content
    reset-content
    partial-content
    multi-status
    already-reported
    im-used})

(defn success?
  [status-code]
  (contains? success status-code))

;; Redirection
;; -----------------------------------------------------------------------------

(def multiple-choice 300)
(def moved-permanently 301)
(def found 302)
(def see-other 303)
(def not-modified 304)
(def use-proxy 305)
(def temporary-redirect 307)
(def permanent-redirect 308)

(def redirection
  #{multiple-choice
    moved-permanently
    found
    see-other
    not-modified
    use-proxy
    temporary-redirect
    permanent-redirect})

(defn redirection?
  [status-code]
  (contains? redirection status-code))

;; Client Errors
;; -----------------------------------------------------------------------------

(def bad-request 400)
(def unauthorized 401)
(def payment-required 402)
(def forbidden 403)
(def not-found 404)
(def method-not-allowed 405)
(def not-acceptable 406)
(def proxy-auth-required 407)
(def request-timeout 408)
(def conflict 409)
(def gone 410)
(def length-required 411)
(def precondition-failed 412)
(def payload-too-large 413)
(def uri-too-long 414)
(def unsupported-media-type 415)
(def range-not-satisfiable 416)
(def expectation-failed 417)
(def teapot 418)
(def misdirected-request 421)
(def unprocessable-entity 422)
(def locked 423)
(def failed-dependency 424)
(def too-early 425)
(def upgrade-required 426)
(def precondition-required 428)
(def too-many-requests 429)
(def request-header-too-large 431)
(def unavailable-legal-reasons 451)

(def client-errors
  #{bad-request
    unauthorized
    payment-required
    forbidden
    not-found
    method-not-allowed
    not-acceptable
    proxy-auth-required
    conflict
    gone
    length-required
    precondition-failed
    payload-too-large
    uri-too-long
    unsupported-media-type
    range-not-satisfiable
    expectation-failed
    teapot
    misdirected-request
    unprocessable-entity
    locked
    failed-dependency
    too-early
    upgrade-required
    precondition-required
    too-many-requests
    request-header-too-large
    unavailable-legal-reasons})

(defn client-error?
  [status-code]
  (contains? client-errors status-code))

;; Server Errors
;; -----------------------------------------------------------------------------

(def internal-server-error 500)
(def not-implemented 501)
(def bad-gateway 502)
(def service-unavailable 503)
(def gateway-timeout 504)
(def http-version-not-supported 505)
(def variant-also-negotiates 506)
(def insufficient-storage 507)
(def loop-detected 508)
(def not-extended 510)
(def network-auth-required 511)

(def server-errors
  #{internal-server-error
    not-implemented
    bad-gateway
    service-unavailable
    gateway-timeout
    http-version-not-supported
    variant-also-negotiates
    insufficient-storage
    loop-detected
    not-extended
    network-auth-required})

(defn server-error?
  [status-code]
  (contains? server-errors status-code))

;; Errors
;; -----------------------------------------------------------------------------

(def errors
  (clojure.set/union client-errors server-errors))

(defn error?
  [status-code]
  (contains? errors status-code))

;; Messages
;; -----------------------------------------------------------------------------

(def message
  {;; Information
   continue "Continue"
   switching-protocols "Switching Protocols"
   processing "Processing"
   early-hints "Early Hints"
   ;; Success
   ok "OK"
   created "Created"
   accepted "Accepted"
   non-authoritative "Non-Authoritative Information"
   no-content "No Content"
   reset-content "Reset Content"
   partial-content "Partial Content"
   multi-status "Multi-Status"
   already-reported "Already Reported"
   im-used "IM Used"
   ;; Redirection
   multiple-choice "Multiple Choice"
   moved-permanently "Moved Permanently"
   found "Found"
   see-other "See Other"
   not-modified "Not Modified"
   use-proxy "Use Proxy"
   temporary-redirect "Temporary Redirect"
   permanent-redirect "Permanent Redirect"
   ;; Client Errors
   bad-request "Bad Request"
   unauthorized "Unauthorized"
   payment-required "Payment Required"
   forbidden "Forbidden"
   not-found "Not Found"
   method-not-allowed "Method Not Allowed"
   not-acceptable "Not Acceptable"
   proxy-auth-required "Proxy Authentication Required"
   conflict "Conflict"
   gone "Gone"
   length-required "Length Required"
   precondition-failed "Precondition Failed"
   payload-too-large "Payload Too Large"
   uri-too-long "URI Too Long"
   unsupported-media-type "Unsupported Media Type"
   range-not-satisfiable "Range Not Satisfiable"
   expectation-failed "Expectation Failed"
   teapot "I'm a teapot"
   misdirected-request "Misdirected Request"
   unprocessable-entity "Unprocessable Entity"
   locked "Locked"
   failed-dependency "Failed Dependency"
   too-early "Too Early"
   upgrade-required "Upgrade Required"
   precondition-required "Precondition Required"
   too-many-requests "Too Many Requests"
   request-header-too-large "Request Header Fields Too Large"
   unavailable-legal-reasons "Unavailable For Legal Reasons"
   ;; Server Errors
   internal-server-error "Internal Server Error"
   not-implemented "Not Implemented"
   bad-gateway "Bad Gateway"
   service-unavailable "Service Unavailable"
   gateway-timeout "Gateway Timeout"
   http-version-not-supported "HTTP Version Not Supported"
   variant-also-negotiates "Variant Also Negotiates"
   insufficient-storage "Insufficient Storage"
   loop-detected "Loop Detected"
   not-extended "Not Extended"
   network-auth-required "Network Authentication Required"})
