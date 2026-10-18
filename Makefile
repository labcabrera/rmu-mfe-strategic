SHARED_LIB_DIR  ?= ../rmu-react-shared-lib
SHARED_LIB_NAME ?= @labcabrera-rmu/rmu-react-shared-lib
IMAGE           ?= labcabrera/rmu-mfe-strategic
IMAGE_TAG       ?= local

.DEFAULT_GOAL := help
.PHONY: help start build docker-build docker-push check-shared-lib link-shared-lib

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

start: check-shared-lib ## Start the dev server with live reload (needs .env, copy it from .env.example)
	@test -f .env || test -f .env.development || { echo "Missing .env. Copy .env.example to .env and adjust the URLs." >&2; exit 1; }
	npm run start:live

build: check-shared-lib ## Build the production bundle into dist/
	npm run build

docker-build: ## Build the static nginx image $(IMAGE):$(IMAGE_TAG), taking the shared lib from SHARED_LIB_DIR
	@test -f "$(SHARED_LIB_DIR)/package.json" || { echo "Missing $(SHARED_LIB_DIR). Set SHARED_LIB_DIR to your rmu-react-shared-lib checkout." >&2; exit 1; }
	docker build --build-context shared-lib="$(SHARED_LIB_DIR)" -t $(IMAGE):$(IMAGE_TAG) .

docker-push: docker-build ## Build and push $(IMAGE):$(IMAGE_TAG) (for example IMAGE_TAG=1.2.0)
	docker push $(IMAGE):$(IMAGE_TAG)

# The shared lib is not published to npm: package.json declares it as file:$(SHARED_LIB_DIR), so
# `npm install` links the local checkout. Its dist/ has to be built first.
check-shared-lib:
	@test -e "node_modules/$(SHARED_LIB_NAME)/dist/index.js" || { echo "$(SHARED_LIB_NAME) is not built or installed. Run 'make link-shared-lib' first." >&2; exit 1; }

link-shared-lib: ## Build the local rmu-react-shared-lib checkout (SHARED_LIB_DIR) and install the file: link
	@test -f "$(SHARED_LIB_DIR)/package.json" || { echo "Missing $(SHARED_LIB_DIR). Set SHARED_LIB_DIR to your rmu-react-shared-lib checkout." >&2; exit 1; }
	@test -d "$(SHARED_LIB_DIR)/node_modules" || npm --prefix "$(SHARED_LIB_DIR)" ci
	npm --prefix "$(SHARED_LIB_DIR)" run build
	npm install
	@echo "Linked $(SHARED_LIB_NAME) from $(SHARED_LIB_DIR)."
