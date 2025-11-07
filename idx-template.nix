{ pkgs, mode ? "stable", ... }: {
  packages = [
    pkgs.nodejs
  ];
  bootstrap = ''
    cp -rf ${./.} "$out"
    chmod -R +w "$out"
    rm -rf "$out/.git" "$out/idx-template".{nix,json}

    npm install typescript @types/node
    npm install saml.servercore${ if mode == "dev" then "@dev" else "" }

    ./build.bash
  '';
}