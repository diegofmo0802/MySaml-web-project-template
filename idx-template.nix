{ pkgs, mode ? "stable", ... }: {
  packages = [
    pkgs.nodejs
  ];
  bootstrap = ''
    cp -rf ${./.} "$out"
    chmod -R +w "$out"
    rm -rf "$out/.git" "$out/idx-template".{nix,json}

    npm install typescrtipt
    npm instal saml.servercore${ if mode && mode == "dev" then "@dev" else "" }

    ./build.bash
  '';
}