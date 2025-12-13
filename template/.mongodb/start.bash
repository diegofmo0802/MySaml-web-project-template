#!/usr/bin/bash
mkdir -p ./.mongodb/var/lib/mongo/
mkdir -p ./.mongodb/var/log/mongodb/
mongod --config ./.mongodb/mongo.conf