#!/bin/bash

echo "Waiting for startup.."
sleep 5
echo "done"

echo Initiate Replicaset - Time now: `date +"%T" `
mongosh --host auth_database:${MONGO_PORT} -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} <<EOF
var cfg = {
    "_id": "replica_set",
    "protocolVersion": 1,
    "version": 1,
    "members": [
        {
            "_id": 0,
            "host": "auth_database:${MONGO_PORT}",
            "priority": 1

        }
    ]
};

rs.initiate(cfg, { force: true });
rs.reconfig(cfg, { force: true });
rs.status();
EOF
