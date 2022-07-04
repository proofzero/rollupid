(ns com.kubelt.git
  (:require
   [clojure.java.shell :refer [sh]]
   [clojure.string :as cstr]))

;; commit
;; -----------------------------------------------------------------------------
;; sh returns a map with keys:
;; :exit => sub-process's exit code
;; :out  => sub-process's stdout (as byte[] or String)
;; :err  => sub-process's stderr (String via platform default encoding)

(defn commit
  "Return a git commit. If no arguments are provided, the HEAD commit-ish
  is returned. Otherwise the commit for the specified revision is
  returned."
  ([]
   (let [default-commit "HEAD"]
     (commit default-commit)))

  ([commit]
   (let [{:keys [exit out err]} (sh "git" "rev-parse" "--verify" commit)]
     (cstr/trim out))))

;; status
;; -----------------------------------------------------------------------------

(defn- changed
  "Convert a aplit 'changed' status line into a map."
  [[xy sub mH mI mW hH hI path]]
  {:status/type :status.type/changed
   :xy xy
   :sub sub
   :mode/head mH
   :mode/index mI
   :mode/worktree mW
   :object/head hH
   :object/index hI
   :path/file path})

(defn- split-x-score
  "Split <X><score> string into separate values. Returns a map
  {:status/type, :change/percent} where the :status/type value is a
  keyword indicating if the change is a file rename or copy, and the
  :change/percent is an integer from 0 to 100 representing a percentage
  similarity between old and new files."
  [Xscore]
  (let [[X score] [(subs Xscore 0 1) (subs Xscore 1)]
        similarity (Integer/parseInt score)
        change-type (condp = X
                      "R" :status.type/renamed
                      "C" :status.type/copied)]
    {:status/type change-type
     :change/percent similarity}))

;; Last part of line is: <path><sep><origPath>.
;;
;; NB: if -z is used sep is a NUL (ASCII 0x00), otherwise it's a
;; TAB (ASCII 0x09).
(defn- renamed-or-copied
  "Convert a split 'renamed/copied' status line into a map."
  [[xy sub mH mI mW hH hI Xscore path origPath]]
  (merge
   (split-x-score Xscore)
   {:xy xy
    :sub sub
    :mode/head mH
    :mode/index mI
    :mode/worktree mW
    :object/head hH
    :object/index hI
    :path/new path
    :path/old origPath}))

(defn- unmerged
  "Convert a split 'unmerged' status line into a map."
  [[xy sub m1 m2 m3 mW h1 h2 h3 path]]
  {:status/type :status.type/unmerged
   :xy xy
   :sub sub
   :mode/stage-1 m1
   :mode/stage-2 m2
   :mode/stage-3 m3
   :mode/worktree mW
   :object/stage-1 h1
   :object/stage-2 h2
   :object/stage-3 h3
   :path/file path})

(defn- untracked
  "Convert a split 'untracked' status line into a map."
  [[path _]]
  {:status/type :status.type/untracked
   :path/file path})

(defn- ignored
  "Convert a split 'ignored' status line into a map."
  [[path _]]
  {:status/type :status.type/ignored
   :path/file path})

(defn- status-line->map
  "A reducing fn that accepts an accumulator vector and a parsed line of
  git status output (as a vector of vectors of strings) and returns the
  accumulating vector with a map conjoined."
  [a [fmt & info]]
  (conj a (condp = fmt
            ;; changed
            "1" (changed info)
            ;; renamed or copied
            "2" (renamed-or-copied info)
            ;; unmerged
            "u" (unmerged info)
            ;; untracked
            "?" (untracked info)
            ;; ignored
            "!" (ignored info)
            (throw (ex-info "unhandled git status format" {:format fmt})))))

(defn- split-whitespace
  "Return a vector of strings produced by splitting a string on its
  whitespace."
  [s]
  (cstr/split s #"\s+"))

;; TODO add --branch
;; TODO add --stash
;; TODO return map {:git/type :git.type/status :branch ... :stash ... :status ...}
(defn status
  "Return a map describing the git status of the repository working tree."
  []
  (let [{:keys [exit out err]} (sh "git" "status" "--porcelain=v2")]
    (when (not= 0 exit)
      (throw (ex-info err {:exit exit})))
    ;; If the output is the empty string, there are no changes in the
    ;; repo to report. Otherwise, convert each parsed line in the
    (if (cstr/blank? out)
      []
      (let [lines (map split-whitespace (cstr/split-lines out))]
        (reduce status-line->map [] lines)))))

;; dirty?
;; -----------------------------------------------------------------------------

(defn dirty?
  "Return true if there are changes in the git repository working tree,
  and false otherwise."
  []
  (let [changes (status)]
    (some? (seq changes))))
