(ns com.kubelt.lib.io.node
  "The Node.js implementation of kubelt io functionality."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [import])
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
   ["path" :as path])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.path :as lib.path]
   [com.kubelt.lib.promise :as lib.promise]))

(defn fs-exists?&
  "Return the file location if exists. Don't throw exception if no exists"
  [file]
  (lib.promise/promise
   (fn [resolve _]
     (-> (.access fs-promises file  (.. fs -constants -F_OK))
         (lib.promise/then (fn [_] (resolve file)))
         (lib.promise/catch (fn [_] (resolve nil)))))))

(defn kubelt-dir
  "Return the dir directory path as a string for an application."
  [app-name folder]
  (let [config-path (lib.path/data app-name)
        kubelt-path (.join path config-path folder)]
    kubelt-path))

(defn ensure-kubelt-dir&
  "Return the directory path for the application as a string, creating it
  if it doesn't already exist. Rejects promise with error message if dir
  isn't available"
  [app-name folder]
  (let [kubelt-dirp (kubelt-dir app-name folder)]
    (lib.promise/promise
     (fn [resolve reject]
       (-> (fs-exists?& kubelt-dirp)
           (lib.promise/then (fn [x]
                               (when-not x
                                 (let [mode "0700"
                                       recursive? true
                                       options #js {:mode mode
                                                    :recursive recursive?}]
                                   (.mkdir fs-promises kubelt-dirp options)))))
           (lib.promise/then
            (fn [_]
              (resolve kubelt-dirp)))
           (lib.promise/catch
               (fn [e]
                 (reject (lib.error/error (str "Dir isn't available" e))))))))))
