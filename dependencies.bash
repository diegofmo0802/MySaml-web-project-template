#!/bin/bash
set -e

remove_build_dir() {
    if [ -d "$1" ]; then
        echo "Removing $1"
        rm -rf "$1"
    fi
}

clone_or_pull() {
    REPO=$1
    DIR=$2

    if [ -d "$DIR" ]; then
        echo "Updating $DIR"
        cd "$DIR"
        git pull || { echo "Failed to update $DIR"; exit 1; }
        cd ..
    else
        echo "Cloning $REPO into $DIR"
        git clone "$REPO" "$DIR" || { echo "Failed to clone $REPO"; exit 1; }
    fi
}

DB_REPO="https://github.com/diegofmo0802/db-manager.git"
WEBAPP_REPO="https://github.com/diegofmo0802/WebApp.git"
QR_CODE_REPO="https://github.com/diegofmo0802/QR-Code.git"
WEBAPP_COMPONENTS_REPO="https://github.com/diegofmo0802/WebApp.components.git"

remove_build_dir "src/DBManager"
remove_build_dir "client/logic/src/WebApp"
remove_build_dir "client/logic/src/QR-Code"
remove_build_dir "src/QR-Code"
# remove_build_dir "client/logic/src/components/basic"
# remove_build_dir "client/source/styles/components/basic"


clone_or_pull "$DB_REPO" ".DBManager"
clone_or_pull "$WEBAPP_REPO" ".WebApp"
clone_or_pull "$QR_CODE_REPO" ".QR-Code"
clone_or_pull "$WEBAPP_COMPONENTS_REPO" ".WebApp.components"

(
    echo "Injecting dependency files from DBManager"
    mkdir -p src/DBManager
    if cp -r .DBManager/src src/DBManager; then
        echo "Successfully injected DBManager"
    else
        echo "Error: Failed to inject DBManager"
    fi
)
(
    echo "Injecting dependency files from WebApp"
    mkdir -p client/logic/src/WebApp
    if cp -r .WebApp/src client/logic/src/WebApp; then
        echo "Successfully injected WebApp"
    else
        echo "Error: Failed to inject WebApp"
    fi
)
(
    echo "Injecting dependency files from QR-Code"
    mkdir -p client/logic/src/QR-Code
    if cp -r .QR-Code/src client/logic/src/QR-Code; then
        echo "Successfully injected QR-Code to client"
    else
        echo "Error: Failed to inject QR-Code to client"
    fi
    if cp -r .QR-Code/src src/QR-Code; then
        echo "Successfully injected QR-Code to src"
    else
        echo "Error: Failed to inject QR-Code to src"
    fi
)
# (
#     echo "Injecting dependency files from WebApp.components"
#     mkdir -p client/logic/src/components/basic
#     if cp -r .WebApp.components/WebApp.components client/logic/src/components/basic; then
#         echo "Successfully injected WebApp.components(components)"
#     else
#         echo "Error: Failed to inject WebApp.components(components)"
#     fi
#     mkdir -p client/source/styles/components/basic
#     if cp -r .WebApp.components/WebApp.components.styles client/source/styles/components/basic; then
#         echo "Successfully injected WebApp.components(styles)"
#     else
#         echo "Error: Failed to inject WebApp.components(styles)"
#     fi
#     mkdir -p client/source/styles/components/basic
#     if cp -r .WebApp.components/WebApp.components.styles.css client/source/styles/components/basic.css; then
#         echo "Successfully injected WebApp.components(styles importer)"
#     else
#         echo "Error: Failed to inject WebApp.components(styles importer)"
#     fi
# )

echo "Dependencies injection completed"