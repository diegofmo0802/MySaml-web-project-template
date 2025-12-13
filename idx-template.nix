{ pkgs, mode ? "stable", ... }: {
  packages = [
    pkgs.git
    pkgs.nodejs
  ];

  bootstrap = ''
    set -e

    cp -R .idx $out
    cp -R .vscode $out
    cp -R template/* $out

    cd $out
    npm init -y
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      pkg.type = 'module';
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
    "
    npm install -D typescript @types/node
    npm install saml.servercore${if mode == "dev" then "@dev" else ""}
    npm install -g saml.dep-manager

  '';
}