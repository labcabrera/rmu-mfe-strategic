#!/bin/sh

echo "📝 Generating env.js dynamically..."

cat <<EOF > /usr/share/nginx/html/env.js
window.env = {
  RMU_FE_STRATEGIC_PUBLIC_PATH: "$RMU_FE_STRATEGIC_PUBLIC_PATH",
  RMU_API_STRATEGIC_URL: "$RMU_API_STRATEGIC_URL",
  RMU_API_CORE_URL: "$RMU_API_CORE_URL"
};
EOF

echo "✅ env.js generated:"
cat /usr/share/nginx/html/env.js
echo "🚀 Starting NGINX..."

exec "$@"
