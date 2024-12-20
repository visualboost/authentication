#!/bin/bash

echo "Start to initialize runtime-env.js"

# Recreate runtime-env config file
rm -f /usr/share/nginx/html/assets/runtime-env.js && touch /usr/share/nginx/html/assets/runtime-env.js

# Check if config file (docker config) exists. If the config file exist the content will be used to generate the runtime-env.js. Otherwise use the environment variables.
if [[ -f config ]]; then
  # The config file that is defined in the docker-compose file
    echo "Config file found. Reading config file..."
    source config
else
    echo "Config file not found. Using environment variables..."
fi

if [[ -z "$DOMAIN" ]]; then
  echo "Error: DOMAIN is not defined."
  exit 1
fi

if [[ -z "$PROTOCOL" ]]; then
  echo "Error: PROTOCOL is not defined."
  exit 1
fi

echo "Create /usr/share/nginx/html/assets/runtime-env.js"
echo "window._env_ = {" >> /usr/share/nginx/html/assets/runtime-env.js

for var in PROTOCOL DOMAIN; do
    # Read value of current variable if exists as Environment variable
    varvalue=$(eval echo "\$$var" | tr -d '\r\n')

    if [ "$varvalue" = "true" ] || [ "$varvalue" = "false" ]; then
            printf "  %s: %s,\n" "$var" "$varvalue" >> /usr/share/nginx/html/assets/runtime-env.js
        else
            printf "  %s: \"%s\",\n" "$var" "$varvalue" >> /usr/share/nginx/html/assets/runtime-env.js
        fi
done

# PORT_BACKEND is optional
if [[ -n "$PROXY_BACKEND_PORT" ]]; then
    clean_port=$(echo "$PROXY_BACKEND_PORT" | tr -d '\n\r')
    printf "  PROXY_BACKEND_PORT: \"%s\",\n" "$clean_port" >> /usr/share/nginx/html/assets/runtime-env.js
else
    echo "PROXY_BACKEND_PORT is not defined and will be ignored."
fi

# PROXY_BACKEND_ROUTE is optional
if [[ -n "${PROXY_BACKEND_ROUTE:-}" ]]; then
    clean_route=$(echo "$PROXY_BACKEND_ROUTE" | tr -d '\n\r')
    printf "  PROXY_BACKEND_ROUTE: \"%s\"\n" "$clean_route" >> /usr/share/nginx/html/assets/runtime-env.js
else
    echo "PROXY_BACKEND_ROUTE is not defined and will be ignored."
fi

echo "}" >> /usr/share/nginx/html/assets/runtime-env.js

echo "Initialized runtime-env.js successfully"
cat /usr/share/nginx/html/assets/runtime-env.js