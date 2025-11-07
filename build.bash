#!/bin/bash
set -e
remove_build_dir() {
    if [ -d "$1" ]; then
        echo "Removing $1"
        rm -rf "$1"
    fi
}

./dependencies.bash

remove_build_dir "build"

echo "Building server"
npm install && npx tsc

cd client/logic
remove_build_dir "build"

echo "Building client"
npm install && npx tsc

echo "Build completed successfully"