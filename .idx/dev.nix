{ pkgs, ... }: {
  channel = "stable-24.05"; # or "unstable"
  packages = [
    pkgs.nodejs
    pkgs.mongodb
  ];
  env = {};
  idx = {
    extensions = [
      "mongodb.mongodb-vscode"
      "rangav.vscode-thunder-client"
      "streetsidesoftware.code-spell-checker"
      "streetsidesoftware.code-spell-checker-spanish"
      "usernamehw.errorlens"
      "yandeu.five-server"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "start"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };
    workspace = {
      onCreate = {
        default.openFiles = [
          "client/app.html"
          "client/logic/src/app.html"
          "src/server.ts"
        ];
      };
      onStart = {
        mongo-db = "./.mongodb/start.bash";
        dev-server = "npm run rt-compile-client";
        client-compiler = "npm run rt-compile-server";
      };
    };
  };
}