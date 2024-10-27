#!/bin/bash

echo "Reading secrets ..."

MONGO_PORT_SECRET="/run/secrets/mongo_port"
MONGO_USER_SECRET="/run/secrets/mongo_user"
MONGO_PASSWORD_SECRET="/run/secrets/mongo_password"

if [[ -f MONGO_PORT_SECRET ]]; then
    echo "$MONGO_PORT_SECRET found. Reading port from file..."
    MONGO_PORT=$(cat "$MONGO_PORT_SECRET" | tr -d '\r' | tr -d '\t' | tr -d '\n')
else
    echo "$MONGO_PORT_SECRET not found. Using environment variables..."
fi

if [[ -f MONGO_USER_SECRET ]]; then
    echo "$MONGO_USER_SECRET found. Reading port from file..."
    MONGO_USER=$(cat "$MONGO_USER_SECRET" | tr -d '\r' | tr -d '\t' | tr -d '\n')
else
    echo "$MONGO_USER_SECRET not found. Using environment variables..."
fi

if [[ -f MONGO_PASSWORD_SECRET ]]; then
    echo "$MONGO_PASSWORD_SECRET found. Reading port from file..."
    MONGO_PASSWORD=$(cat "$MONGO_PASSWORD_SECRET" | tr -d '\r' | tr -d '\t' | tr -d '\n')
else
    echo "$MONGO_PASSWORD_SECRET not found. Using environment variables..."
fi

#Check secrets
if [[ -z "$MONGO_PORT" ]]; then
    echo "Error: MONGO_PORT is empty"
    exit 1
fi

if [[ -z "$MONGO_USER" ]]; then
    echo "Error: MONGO_USER is empty"
    exit 1
fi

if [[ -z "$MONGO_PASSWORD" ]]; then
    echo "Error: MONGO_PASSWORD is empty"
    exit 1
fi

echo "Waiting for startup..."
sleep 5

echo "Initialize Replicaset..."
echo Initiate Replicaset - Time now: `date +"%T" `
mongosh --host auth_database --port $MONGO_PORT -u $MONGO_USER -p $MONGO_PASSWORD <<EOF

var cfg = {
    "_id": "replica_set",
    "protocolVersion": 1,
    "version": 1,
    "members": [
        {
            "_id": 0,
            "host": "auth_database:$MONGO_PORT",
            "priority": 1
        }
    ]
};

rs.initiate(cfg, { force: true });
rs.reconfig(cfg, { force: true });
rs.status();
EOF