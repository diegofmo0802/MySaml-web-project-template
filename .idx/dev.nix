{ pkgs, ... }: {
  channel = "stable-24.05"; # or "unstable"
  packages = [
    pkgs.git
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
          "assets/app.html"
          "client/logic/src/logic.ts"
          "client/logic/src/app.ts"
          "src/server.ts"
        ];
      };
      onStart = {
        mongo-db = "./.mongodb/start.bash";
        dev-server = "npm run dev";
        fixer-server = "npm run dev.fixer";
        dev-client = "npm run dev-client";
        fixer-client = "npm run dev-client.fixer";
      };
    };
  };
}