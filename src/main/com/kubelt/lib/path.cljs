(ns com.kubelt.lib.path
  "Path-related methods for getting OS-specific locations to store data,
  configuration, etc."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["os" :as os]
   ["path" :as path]
   ["process" :as process])
  (:require
   [goog.object])
  (:require
   [com.kubelt.lib.util :as util]))

;; TODO test me (all OSes)

;; Internal
;; -----------------------------------------------------------------------------
;; TODO make utility/process/environment namespace and move that
;; functionality there.

(defn- macos
  [name]
  {:pre [(string? name)]}
  (let [{:keys [home-dir tmp-dir]} (util/node-env)
        library (.join path home-dir "Library")
        data (.join path library "Application Support" name)
        config (.join path library "Preferences" name)
        cache (.join path library "Caches" name)
        log (.join path library "Logs" name)
        temp (.join path tmp-dir name)]
    {:data data
     :config config
     :cache cache
     :log log
     :temp temp}))

(defn- windows
  [name]
  {:pre [(string? name)]}
  (let [{:keys [environment home-dir tmp-dir]} (util/node-env)
        app-data (if-let [app-data (get environment "APPDATA")]
                   app-data
                   (.join path home-dir "AppData" "Roaming"))
        local-app-data (if-let [local-app-data (get environment "LOCALAPPDATA")]
                         local-app-data
                         (.join path home-dir "AppData" "Local"))
        data (.join path local-app-data name "Data")
        config (.join path app-data name "Config")
        cache (.join path local-app-data name "Cache")
        log (.join path local-app-data name "Log")
        temp (.join path tmp-dir name)]
    {:data data
     :config config
     :cache cache
     :log log
     :temp temp}))

(defn- linux
  [name]
  {:pre [(string? name)]}
  (let [{:keys [environment home-dir tmp-dir username]} (util/node-env)
        data (or (get environment "XDG_DATA_HOME")
                 (.join path home-dir ".local" "share" name))
        config (or (get environment "XDG_CONFIG_HOME")
                   (.join path home-dir ".config" name))
        cache (or (get environment "XDG_CACHE_HOME")
                  (.join path home-dir ".cache" name))
        log (or (get environment "XDG_STATE_HOME")
                (.join path home-dir ".local" "state" name))
        temp (.join path tmp-dir username name)]
    {:data data
     :config config
     :cache cache
     :log log
     :temp temp}))

;; Public
;; -----------------------------------------------------------------------------

(defn paths
  [app-name]
  (condp = (.-platform process)
    "darwin" (macos app-name)
    "win32" (windows app-name)
    "linux" (linux app-name)))

(defn cache
  "Return the path for cached data."
  [app-name]
  {:pre [(string? app-name)]}
  (:cache (paths app-name)))

(defn config
  "Return the path for configuration data."
  [app-name]
  {:pre [(string? app-name)]}
  (:config (paths app-name)))

(defn data
  "Return the path from application data."
  [app-name]
  {:pre [(string? app-name)]}
  (:data (paths app-name)))

(defn log
  "Return the path for application logs."
  [app-name]
  {:pre [(string? app-name)]}
  (:log (paths app-name)))

(defn temp
  "Return the path for temp data."
  [app-name]
  {:pre [(string? app-name)]}
  (:temp (paths app-name)))
