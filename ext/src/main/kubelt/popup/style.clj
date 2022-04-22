(ns kubelt.popup.style
  "Generate the popup panel CSS."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.tools.cli :refer [parse-opts]]
   [garden.core :as g]
   [garden.selectors :as gs]
   [shadow.cljs.devtools.api :as shadow]))


(def style
  [[:html :body {:height "100%"
                 :width "100%"
                 :margin 0
                 :box-sizing "border-box"}]

   [:body {:height "90%"
           :font :caption
           :background-color "#000000"}]

   [:p {:margin "1em 2em"}]

   [:#content {:height "90%"
               :margin "2em 2em 0 2em"
               :border ".5em solid #dde4e9"
               :transition "background-color .2s ease-out"}]])

(def cli-options
  [["-o" "--out-file NAME" "Output file name"
    :default "target/popup.css"]])

(defn generate
  [& args]
  (shadow/compile :kubelt)
  (let [{:keys [options] :as opts} (parse-opts args cli-options)
        {:keys [out-file]} options
        css-str (g/css style)]
    (spit out-file css-str)))
