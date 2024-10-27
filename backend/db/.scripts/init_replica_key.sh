#!/bin/bash

echo "Set file permission for replica key"
chmod 400 /key/mongo_replica_key
echo "Change file owner"
chown 999:999 /key/mongo_replica_key

echo "Execute mongo entrypoint"
exec docker-entrypoint.sh "$@"
