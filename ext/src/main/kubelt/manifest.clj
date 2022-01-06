(ns kubelt.manifest
  "Generate the extension manifest.json."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str]
   [clojure.tools.cli :refer [parse-opts]]
   [jsonista.core :as j]
   [shadow.cljs.devtools.api :as shadow]))

(def extension-name
  "Kubelt")

(def extension-description
  "Manage your Kubelt content.")

(def extension-version
  "0.1")

(def homepage-url
  "https://kubelt.com/plugin/")

(def title
  "Kubelt")

;; Loosen the default security policy to allow the extension to use
;; eval() by setting 'unsafe-eval'. We need this in order to instantiate
;; a Web/SharedWorker.
;;
;; Cf. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy
;
(def content-security-policy
  (str/join "; " ["script-src 'self' 'unsafe-eval'"
                  "object-src 'self'"]) )

(def gecko-min-version
  "54.0a1")

;; For more details on available permissions:
;; cf. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions
(def permissions
  [;; When the user interacts with the extension, it is
   ;; granted extra permissions for the active tab only:
   ;; - inject JavaScript into tab using browser.tabs.executeScript()
   ;; - inject CSS into tab using browser.tabs.insertCSS()
   ;; - access privileged parts of tabs API for the
   ;;   current tab: Tab.url, Tab.title, Tab.faviconUrl
   :activeTab
   ;; Access browser storage.
   :storage
   ;; Access the set of tabs via the Tab API.
   :tabs])

;; A content script is a part of your extension that runs in the
;; context of a particular web page (as opposed to background scripts
;; which are part of the extension, or scripts which are part of the
;; web site itself, such as those loaded using the <script> element).
;;
;; Content scripts can only access a small subset of the WebExtension
;; APIs, but they can communicate with background scripts using a
;; messaging system, and thereby indirectly access the WebExtension
;; APIs.
;;
;; cf. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
(def content-scripts
  [])

;; Resources packaged with the extension that should be accessible to
;; web pages. For example, we might package an image that will replace
;; some content in a page.
(def web-accessible-resources
  [])

(def manifest
  {:manifest_version 2
   :name extension-name
   :description extension-description
   :version extension-version
   :homepage_url homepage-url
   :browser_specific_settings {:gecko {:strict_min_version gecko-min-version}}
   :content_security_policy content-security-policy
   :icons {"48" "icons/icon-48.png"}
   :content_scripts content-scripts
   :browser_action {:default_icon "icons/icon-32.png"
                    :default_title title
                    :default_popup "popup.html"}
   :sidebar_action {:default_icon "icons/icon-48.png"
                    :default_title title
                    :default_panel "sidebar.html"}
   :web_accessible_resources web-accessible-resources
   :permissions permissions
   :commands {:_execute_sidebar_action {:suggested_key {:default "Ctrl+Shift+Y"}}}})

(def cli-options
  [["-o" "--out-file NAME" "Output file name"
    :default "target/manifest.json"]])

(defn generate
  [& args]
  ;; Executed as part of the shadow-cljs :firefox build.
  (shadow/compile :kubelt)
  (let [{:keys [options] :as opts} (parse-opts args cli-options)
        {:keys [out-file]} options
        json-str (j/write-value-as-string manifest)]
    (spit out-file json-str)))
