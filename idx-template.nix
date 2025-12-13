{ pkgs, mode ? "stable", ... }: {
  packages = [
    pkgs.git
    pkgs.nodejs
  ];

  bootstrap = ''
    set -e

    cp -R ${./.}/.idx $out
    cp -R ${./.}/.vscode $out
    cp -R ${./.}/template/* $out

    cd $out
    npm init -y
    npm pkg set type=module
    npm install -D typescript @types/node
    npm install saml.servercore${if mode == "dev" then "@dev" else ""}
    npm install -g saml.dep-manager
    dep install

    chmod +x .mongodb/start.bash
  '';
}