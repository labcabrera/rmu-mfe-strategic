# syntax=docker/dockerfile:1
#
# Static image: production bundle served by nginx. env-config.js is rendered at runtime from
# public/env-config.template.js by the template mechanism of the nginx image.
# package.json declares rmu-react-shared-lib as link:../rmu-react-shared-lib, so the lib comes from a
# named build context and is placed next to /app:
#   docker build --build-context shared-lib=../rmu-react-shared-lib -t labcabrera/rmu-mfe-strategic:local .
# (`make docker-build` does this.)

# pnpm comes from corepack, pinned by the packageManager field of package.json
FROM node:24-alpine AS pnpm-base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM pnpm-base AS shared-lib-build
WORKDIR /rmu-react-shared-lib
COPY --from=shared-lib package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=shared-lib src ./src
RUN pnpm run build

FROM pnpm-base AS build
# The peers of the lib (react, MUI…) resolve from the MFE: see resolve.modules in webpack.config.ts.
COPY --from=shared-lib-build /rmu-react-shared-lib /rmu-react-shared-lib
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine
# The entrypoint of the image renders /etc/nginx/templates into this directory, only with the RMU_ variables.
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html NGINX_ENVSUBST_FILTER=^RMU_
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/env-config.template.js /etc/nginx/templates/env-config.js.template
EXPOSE 80
