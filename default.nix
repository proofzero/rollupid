# { pkgs ? import <nixpkgs> {} }:
with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "kubelt";

  nativeBuildInputs = [ pkg-config ];
  
  buildInputs = [
    clojure
    clojure-lsp
    babashka
    leiningen
    nodejs-16_x
    jdk
    docker
    google-chrome
    chromedriver
    act
    docker
    rustup
    libuuid
    act
  ];

  APPEND_LIBRARY_PATH = "${lib.makeLibraryPath [ libGL libuuid ]}";


  shellHook = ''
    LD=$CC
    export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"

  '';

}

