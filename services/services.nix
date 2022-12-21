with (import <nixpkgs> {});
let
  basePackages = [
    nodejs-18_x
    yarn
    pkg-config
  ];

  inputs = basePackages
    ++ lib.optionals stdenv.isLinux [
    ]
    ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
      ]);

in mkShell {
  name = "kubelt/platform";
  allowUnfree = true;

  nativeBuildInputs = [ 
    pkg-config
  ];

  buildInputs = inputs;

  shellHook = ''
    LD=$CC
    export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
  '';
}
