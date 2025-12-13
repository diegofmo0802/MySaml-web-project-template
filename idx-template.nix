{ pkgs, mode ? "stable", ... }: {
  packages = [
    pkgs.git
    pkgs.nodejs
  ];

  bootstrap = ''
    set -e

    mkdir "$out"
    cp -rf ${./.}/.idx "$out"
    cp -rf ${./.}/.vscode "$out"
    cp -rf ${./.}/template/. "$out"

    cd "$out"
    npm init -y
    npm pkg set type=module
    npm install -D typescript @types/node
    npm install saml.servercore${if mode == "dev" then "@dev" else ""}
    npm install saml.dep-manager
    npx dep install

    chmod +x .mongodb/start.bash
  '';
}