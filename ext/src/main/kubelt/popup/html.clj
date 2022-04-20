(ns kubelt.popup.html
  "Generate the popup window HTML."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.tools.cli :refer [parse-opts]]
   [hiccup.core :as h]
   [shadow.cljs.devtools.api :as shadow]))

(def panel
  [:html
    [:head
     [:meta {:charset "utf-8"}]
     [:link {:rel "stylesheet" :href "popup.css"}]]

    [:body
     [:div {:id "content"}]
     [:p "Click inside the box to start taking notes on this page."]
     [:script {:src "shared.js"}]
     [:script {:src "popup.js"}]]])

(def cli-options
  [["-o" "--out-file NAME" "Output file name"
    :default "target/popup.html"]])

(defn generate
  [& args]
  (shadow/compile :kubelt)
  (let [{:keys [options] :as opts} (parse-opts args cli-options)
        {:keys [out-file]} options
        html-str (h/html panel)]
    (spit out-file html-str)))
