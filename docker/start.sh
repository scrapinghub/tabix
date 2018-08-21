#!/usr/bin/env bash
set -e



# Replace host in nginx proxy config (use percentage because urls contain slashes)
sed -i "s%@CH_HOST@%$CH_HOST%g" /etc/nginx/sites-enabled/default
# Create basic auth header based on login and password
CH_AUTH=$(echo -n "${CH_LOGIN:-default}:$CH_PASSWORD" | base64)
sed -i "s/@CH_AUTH@/$CH_AUTH/g" /etc/nginx/sites-enabled/default

# Set default connection to point to local proxy
CONN="window.global_tabix_default_settings.name=\"${CH_NAME:-default}\";"
CONN+="window.global_tabix_default_settings.login=\"default\";"
CONN+="window.global_tabix_default_settings.host=window.location.origin + \"/_proxy\";"
if [ ! -z "$CH_PARAMS" ]; then
   CONN+="window.global_tabix_default_settings.params=\"${CH_PARAMS}\";"
fi

if [ ! -z "$CONN" ]; then
  INDEX=$(cat /var/www/html/index.html)
  # Insert the connection string at the start of index.html if it does not already exist.
  if [[ $INDEX != *"window.global_tabix_default_settings"* ]]; then
    CONN="<script>window.global_tabix_default_settings={};${CONN}</script>"
    # Use simple bash replacement to avoid escaping complexity.
    INDEX=${INDEX/<head>/<head>$CONN}
    echo $INDEX > /var/www/html/index.html
  fi
fi

nginx -g "daemon off;"
