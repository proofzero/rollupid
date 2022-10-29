{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs-16_x
    pkgs.docker
    pkgs.google-chrome
    pkgs.chromedriver
  ];
}
