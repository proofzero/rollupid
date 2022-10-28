with (import <nixpkgs> {});
let
  basePackages = [
    ripgrep
    nodejs-18_x
    yarn
    jdk
    docker
    chromedriver
    docker
    rustup
    libuuid
    act
    cairo
    pango
    pkg-config
    nodePackages.node-gyp
    libpng
    llvm
    librsvg
    pixman
    giflib
    libjpeg
  ];

  inputs = basePackages
    ++ lib.optional stdenv.isLinux inotify-tools
    ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
        CoreFoundation
        CoreServices
        CoreText
      ]);

in mkShell {
  name = "kubelt";

  nativeBuildInputs = [ 
    pkg-config
  ];

  buildInputs = inputs;

  # APPEND_LIBRARY_PATH = "${lib.makeLibraryPath [
  #   pkg-config
  #   nodePackages.node-gyp
  #   cairo
  #   pango
  #   libpng
  #   llvm
  #   librsvg
  #   pixman
  #   giflib
  #   libjpeg 
  # ]}";

  shellHook = ''
    LD=$CC
    export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
  '';
}

# # { pkgs ? import <nixpkgs> {} }:
# with import <nixpkgs> {};

# stdenv.mkDerivation {
#   name = "kubelt";

#   nativeBuildInputs = [ 
#     pkg-config
#   ];
  
#   buildInputs = [
#     nodejs-16_x
#     yarn
#     jdk
#     docker
#     chromedriver
#     docker
#     rustup
#     libuuid
#     act
#     cairo
#     pango
#     pkg-config
#     nodePackages.node-gyp
#     libpng
#     llvm
#     librsvg
#     pixman
#     giflib
#     libjpeg
#     pkgs.darwin.apple_sdk.frameworks.CoreText
#   ];

    
#   # APPEND_LIBRARY_PATH = "${lib.makeLibraryPath [
#   #   pkg-config
#   #   nodePackages.node-gyp
#   #   cairo
#   #   pango
#   #   libpng
#   #   llvm
#   #   librsvg
#   #   pixman
#   #   giflib
#   #   libjpeg 
#   # ]}";

#   shellHook = ''
#     LD=$CC
#     export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
#   '';

# }