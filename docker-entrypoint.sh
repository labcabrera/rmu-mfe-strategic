#!/bin/sh

echo "📝 Generando env.js dinámicamente..."

cat <<EOF > /usr/share/nginx/html/env.js
window.env = {
  RMU_FE_STRATEGIC_PUBLIC_PATH: "$RMU_FE_STRATEGIC_PUBLIC_PATH",
  RMU_API_STRATEGIC_URL: "$RMU_API_STRATEGIC_URL",
  RMU_API_CORE_URL: "$RMU_API_CORE_URL"
};
EOF

echo "✅ env.js generado:"
cat /usr/share/nginx/html/env.js
echo "🚀 Iniciando NGINX..."

exec "$@"