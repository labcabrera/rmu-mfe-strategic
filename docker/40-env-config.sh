#!/bin/sh
# Run by the nginx image entrypoint (/docker-entrypoint.d) before nginx starts: renders the runtime
# configuration from the container environment. Only the ${KEY} placeholders of the template are
# substituted, so no other variable reaches the browser.
set -eu

html=/usr/share/nginx/html
envsubst < "${html}/env-config.template.js" > "${html}/env-config.js"
echo "40-env-config.sh: wrote ${html}/env-config.js"
