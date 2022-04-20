(ns com.kubelt.ddt.prompt
  "Configuration for prompt."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["prompt" :as prompt])
  (:require
   [clojure.string :as cstr]))

(defn- pw-clean
  [s]
  ;; TODO should we do this?
  ;; Trim whitespace from before/after input.
  (cstr/trim s))

(def pw-regex
  #"^\w+$")

(def password-config
  {:password
   {:description "Enter your password"
    :type "string"
    ;; TODO constrain the password
    ;;:pattern pw-regex
    ;; TODO update regex failure error message
    :message "Password must be letters"
    :hidden true
    :replace "*"
    :required true
    ;; Run before callbacks, can modify user's input.
    :before pw-clean}})

(def confirm-config
  {:confirm
   {:description "Confirm your password"
    :type "string"
    ;; TODO constrain the password
    ;;:pattern pw-regex
    ;; TODO update regex failure error message
    :message "Password must be letters"
    :hidden true
    :replace "*"
    :required true
    :before pw-clean}})

;; The prompt schema determines what is asked for from the user.
;; NB: "before" fn is run before callbacks and can modify user's input.

(def ask-schema
  (clj->js
   {:properties password-config}))

(def confirm-schema
  (clj->js
   {:properties (merge password-config
                       confirm-config)}))

(def truthy-map
  {"y" true
   "yes" true
   "true" true
   "t" true
   "n" false
   "no" false
   "false" false
   "f" false})

(def truthy-set
  (into #{} (keys truthy-map)))

(def rm-schema
  (clj->js
   {:properties
    {:confirm
     {:description "Are you sure [yes/no]?"
      :type "string"
      :required true
      :before (fn [x]
                (-> x cstr/trim cstr/lower-case))
      :conform (fn [x]
                 (contains? truthy-set x))}}}))

;; Public
;; -----------------------------------------------------------------------------

(defn ask-password!
  "Prompt the user for their password. Expects a callback function that
  accepts an error and a result parameter: (fn [err result] ...)."
  [callback]
  {:pre [(fn? callback)]}
  ;; Remove the preliminary prompt set by default in "prompt" library.
  (set! (.-message prompt) "")
  ;; Prompt the user for their wallet password.
  (.start prompt)
  (.get prompt ask-schema callback))

(defn confirm-password!
  "Prompt the user for their password twice and passes along an error
  message message if they're not identical. Expects a callback function
  that accepts an error and a result parameter: (fn [err result] ...)."
  [callback]
  {:pre [(fn? callback)]}
  ;; Remove the preliminary prompt set by default in "prompt" library.
  (set! (.-message prompt) "")
  ;; Prompt the user for their wallet password.
  (.start prompt)
  (.get prompt confirm-schema
        (fn [err result]
          (let [password (.-password result)
                confirm (.-confirm result)]
            (when-not (= password confirm)
              (callback "passwords do not match" #js {})))
          (callback err result))))

(defn confirm-rm!
  "Prompt the user to confirm that they want to delete a wallet."
  [callback]
  {:pre [(fn? callback)]}
  ;; Remove the preliminary prompt set by default in "prompt" library.
  (set! (.-message prompt) "")
  ;; Display the prompt.
  (.start prompt)
  (.get prompt rm-schema (fn [err result]
                           (let [confirm-str (.-confirm result)
                                 rm? (get truthy-map confirm-str false)]
                             (callback err rm?)))))
