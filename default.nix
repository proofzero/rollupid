{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.clojure
    pkgs.clojure-lsp
    pkgs.babashka
    pkgs.leiningen
    pkgs.nodejs-16_x
    pkgs.jdk
    pkgs.docker
    pkgs.google-chrome
    pkgs.chromedriver
  ];
}