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
    npm pkg set scripts.compile="npx tsc && npx tsc -p client/logic"
    npm pkg set scripts.build="npm install && npx dep install && cd client/logic && npx tsc && cd ../../ && npm run compile"
    npm pkg set scripts.dev="npx tsc --watch"
    npm pkg set scripts.dev-client="npx tsc -p client/logic --watch"
    npm pkg set scripts.start="node build/server.js"
    npm install -D typescript @types/node
    npm install saml.servercore${if mode == "dev" then "@dev" else ""}
    npm install saml.dep-manager
    npm install mongodb
    
    npx dep install
    npm run compile

    ls -la
    chmod +x .mongodb/start.bash
    cd ${./.}
  '';
}