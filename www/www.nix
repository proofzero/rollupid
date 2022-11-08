with (import <nixpkgs> {});
let
  basePackages = [
    nodejs-18_x
    yarn
    pkg-config
    nodePackages.node-gyp
    hugo
    # TODO: For local dev it's nice to have but you can always add them manudal
    # docker
    # chromedriver
    # act
  ];

  inputs = basePackages
    ++ lib.optional stdenv.isLinux inotify-tools
    ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
      ]);

in mkShell {
  name = "kubelt";
  allowUnfree = true;

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
