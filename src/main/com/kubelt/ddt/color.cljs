(ns com.kubelt.ddt.color
  "Color-related utilities."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   ["@colors/colors" :as colors]))

;; Public
;; -----------------------------------------------------------------------------

(def hilite colors/magenta)

(def error colors/red)

(def warn colors/yellow)

(def info colors/green)

(def help colors/cyan)

(def debug colors/blue)

(def data colors/grey)

(def prompt colors/grey)

;; text colors
;;     black
;;     red
;;     green
;;     yellow
;;     blue
;;     magenta
;;     cyan
;;     white
;;     gray
;;     grey

;; bright text colors
;;     brightRed
;;     brightGreen
;;     brightYellow
;;     brightBlue
;;     brightMagenta
;;     brightCyan
;;     brightWhite

;; background colors
;;     bgBlack
;;     bgRed
;;     bgGreen
;;     bgYellow
;;     bgBlue
;;     bgMagenta
;;     bgCyan
;;     bgWhite
;;     bgGray
;;     bgGrey

;; bright background colors
;;     bgBrightRed
;;     bgBrightGreen
;;     bgBrightYellow
;;     bgBrightBlue
;;     bgBrightMagenta
;;     bgBrightCyan
;;     bgBrightWhite

;; styles
;;     reset
;;     bold
;;     dim
;;     italic
;;     underline
;;     inverse
;;     hidden
;;     strikethrough

;; extras
;;     rainbow
;;     zebra
;;     america
;;     trap
;;     random
