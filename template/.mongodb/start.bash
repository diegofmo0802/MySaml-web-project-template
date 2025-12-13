#!/usr/bin/bash

running=$(mongo --quiet --eval "db.adminCommand('ping').ok" || echo "0");

if [ "$running" != "1" ]; then
    mkdir -p ./.mongodb/var/lib/mongo/;
    mkdir -p ./.mongodb/var/log/mongodb/;
    mongod --config ./.mongodb/mongo.conf;
else
    echo "ℹ️ mongo already running";
fi

echo "⏳ waiting for mongo service...";
until mongo --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 1;
done
echo "✅ mongo db now is running";

status=$(mongo --quiet --eval "rs.status().ok" || echo "0");

if [ "$status" != "1" ]; then
  echo "🔧 initializing replication server set...";
  mongo --quiet --eval "rs.initiate()";
  echo "✅ Replication initialized";
else
    echo "ℹ️ Replication already initialized";
fi