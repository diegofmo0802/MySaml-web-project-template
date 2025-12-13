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
    chmod -R +w "$out"
    
    npm init -y
    npm pkg set type="module"
    npm pkg set main="build/server.js"
    npm pkg set script.compile="npx tsc && npx tsc -p client/logic"
    npm pkg set script.build="npm install && npx dep install && cd client/logic && npx tsc && cd ../../ && npm run compile"
    npm pkg set script.dev="npx tsc --watch"
    npm pkg set script.dev-client="npx tsc -p client/logic --watch"
    npm pkg set script.start="node build/server.js"
    npm install -D typescript @types/node
    npm install saml.servercore${if mode == "dev" then "@dev" else ""}
    npm install saml.dep-manager
    npx dep install

    ls -la
    chmod +x .mongodb/start.bash
    cd ${./.}
  '';
}