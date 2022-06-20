(ns com.kubelt.lib.jwt.signature
  "JWT signature validation."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.base64 :as lib.base64]))

;; Message Signature or MAC Validation

;;    When validating a JWS, the following steps are performed.  The order
;;    of the steps is not significant in cases where there are no
;;    dependencies between the inputs and outputs of the steps.  If any of
;;    the listed steps fails, then the signature or MAC cannot be
;;    validated.

;;    When there are multiple JWS Signature values, it is an application
;;    decision which of the JWS Signature values must successfully validate
;;    for the JWS to be accepted.  In some cases, all must successfully
;;    validate, or the JWS will be considered invalid.  In other cases,
;;    only a specific JWS Signature value needs to be successfully
;;    validated.  However, in all cases, at least one JWS Signature value
;;    MUST successfully validate, or the JWS MUST be considered invalid.

;;    1.  Parse the JWS representation to extract the serialized values for
;;        the components of the JWS.  When using the JWS Compact
;;        Serialization, these components are the base64url-encoded
;;        representations of the JWS Protected Header, the JWS Payload, and
;;        the JWS Signature, and when using the JWS JSON Serialization,
;;        these components also include the unencoded JWS Unprotected
;;        Header value.  When using the JWS Compact Serialization, the JWS
;;        Protected Header, the JWS Payload, and the JWS Signature are
;;        represented as base64url-encoded values in that order, with each
;;        value being separated from the next by a single period ('.')
;;        character, resulting in exactly two delimiting period characters
;;        being used.  The JWS JSON Serialization is described in
;;        Section 7.2.

;;    2.  Base64url-decode the encoded representation of the JWS Protected
;;        Header, following the restriction that no line breaks,
;;        whitespace, or other additional characters have been used.

;;    3.  Verify that the resulting octet sequence is a UTF-8-encoded
;;        representation of a completely valid JSON object conforming to
;;        RFC 7159 [RFC7159]; let the JWS Protected Header be this JSON
;;        object.

;;    4.  If using the JWS Compact Serialization, let the JOSE Header be
;;        the JWS Protected Header.  Otherwise, when using the JWS JSON
;;        Serialization, let the JOSE Header be the union of the members of
;;        the corresponding JWS Protected Header and JWS Unprotected
;;        Header, all of which must be completely valid JSON objects.
;;        During this step, verify that the resulting JOSE Header does not
;;        contain duplicate Header Parameter names.  When using the JWS
;;        JSON Serialization, this restriction includes that the same
;;        Header Parameter name also MUST NOT occur in distinct JSON object
;;        values that together comprise the JOSE Header.

;;    5.  Verify that the implementation understands and can process all
;;        fields that it is required to support, whether required by this
;;        specification, by the algorithm being used, or by the "crit"
;;        Header Parameter value, and that the values of those parameters
;;        are also understood and supported.

;;    6.  Base64url-decode the encoded representation of the JWS Payload,
;;        following the restriction that no line breaks, whitespace, or
;;        other additional characters have been used.

;;    7.  Base64url-decode the encoded representation of the JWS Signature,
;;        following the restriction that no line breaks, whitespace, or
;;        other additional characters have been used.

;;    8.  Validate the JWS Signature against the JWS Signing Input
;;        ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.' ||
;;        BASE64URL(JWS Payload)) in the manner defined for the algorithm
;;        being used, which MUST be accurately represented by the value of
;;        the "alg" (algorithm) Header Parameter, which MUST be present.
;;        See Section 10.6 for security considerations on algorithm
;;        validation.  Record whether the validation succeeded or not.

;;    9.  If the JWS JSON Serialization is being used, repeat this process
;;        (steps 4-8) for each digital signature or MAC value contained in
;;        the representation.

;;    10. If none of the validations in step 9 succeeded, then the JWS MUST
;;        be considered invalid.  Otherwise, in the JWS JSON Serialization
;;        case, return a result to the application indicating which of the
;;        validations succeeded and failed.  In the JWS Compact
;;        Serialization case, the result can simply indicate whether or not
;;        the JWS was successfully validated.

;;    Finally, note that it is an application decision which algorithms may
;;    be used in a given context.  Even if a JWS can be successfully
;;    validated, unless the algorithm(s) used in the JWS are acceptable to
;;    the application, it SHOULD consider the JWS to be invalid.

;; valid?
;; -----------------------------------------------------------------------------

(defn valid?
  "Given a decoded JWT token, check the signature are return true if it's
  valid, and false otherwise."
  [key m]
  {:pre [(map? m)]}
  ;; TODO check that the signature used is supported
  ;; TODO decode the signature
  (let [signature (get-in m [:token/encoded :signature])
        decoded-sig (lib.base64/decode-bytes signature)]
    (prn (type decoded-sig))
    ;;    8.  Validate the JWS Signature against the JWS Signing Input
    ;;        ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.' ||
    ;;        BASE64URL(JWS Payload)) in the manner defined for the algorithm
    ;;        being used, which MUST be accurately represented by the value of
    ;;        the "alg" (algorithm) Header Parameter, which MUST be present.
    ;;        See Section 10.6 for security considerations on algorithm
    ;;        validation.  Record whether the validation succeeded or not.
    true))
