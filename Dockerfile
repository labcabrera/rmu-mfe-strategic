# syntax=docker/dockerfile:1
#
# Static image: production bundle served by nginx, configured at runtime (docker/40-env-config.sh).
# rmu-react-shared-lib is not published to a registry yet, so it comes from a named build context:
#   docker build --build-context shared-lib=../rmu-react-shared-lib -t labcabrera/rmu-mfe-strategic:local .
# (`make docker-build` does this.)

FROM node:24-alpine AS shared-lib-build
WORKDIR /shared-lib
COPY --from=shared-lib package.json package-lock.json tsconfig.json ./
RUN npm ci --ignore-scripts
COPY --from=shared-lib src ./src
RUN npm run build && npm pack --pack-destination /tmp

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY --from=shared-lib-build /tmp/*.tgz /tmp/
RUN npm install --no-save --ignore-scripts /tmp/*.tgz
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
