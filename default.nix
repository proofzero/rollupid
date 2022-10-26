# { pkgs ? import <nixpkgs> {} }:
with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "kubelt";

  nativeBuildInputs = [ pkg-config ];
  
  buildInputs = [
    nodejs-16_x
    jdk
    docker
    chromedriver
    docker
    rustup
    libuuid
    act 
  ];

    
  # APPEND_LIBRARY_PATH = "${lib.makeLibraryPath [ libGL libuuid google-chrome-dev]}";

  # shellHook = ''
  #   LD=$CC
  #   export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
  # '';

}