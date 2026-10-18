# syntax=docker/dockerfile:1
#
# Static image: production bundle served by nginx, configured at runtime (docker/40-env-config.sh).
# package.json declares rmu-react-shared-lib as file:../rmu-react-shared-lib, so the lib comes from a
# named build context and is placed next to /app:
#   docker build --build-context shared-lib=../rmu-react-shared-lib -t labcabrera/rmu-mfe-strategic:local .
# (`make docker-build` does this.)

FROM node:24-alpine AS shared-lib-build
WORKDIR /rmu-react-shared-lib
COPY --from=shared-lib package.json package-lock.json tsconfig.json ./
RUN npm ci --ignore-scripts
COPY --from=shared-lib src ./src
# Keep only the lib's own runtime dependencies: its peers (react, MUI…) resolve from the MFE.
RUN npm run build && npm prune --omit=dev --omit=peer --ignore-scripts

FROM node:24-alpine AS build
COPY --from=shared-lib-build /rmu-react-shared-lib/package.json /rmu-react-shared-lib/
COPY --from=shared-lib-build /rmu-react-shared-lib/dist /rmu-react-shared-lib/dist
COPY --from=shared-lib-build /rmu-react-shared-lib/node_modules /rmu-react-shared-lib/node_modules
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
