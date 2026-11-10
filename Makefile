REMOTE          ?= origin
MASTER_BRANCH   ?= master
DEVELOP_BRANCH  ?= develop
RELEASE_BUMP    ?=
SHARED_LIB_DIR  ?= ../rmu-react-shared-lib
SHARED_LIB_NAME ?= @labcabrera-rmu/rmu-react-shared-lib
IMAGE           ?= labcabrera/rmu-mfe-strategic
IMAGE_TAG       ?= local

.DEFAULT_GOAL := help
.PHONY: help start build docker-build docker-push check-shared-lib link-shared-lib create-release

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

start: check-shared-lib ## Start the dev server with live reload (needs .env, copy it from .env.example)
	@test -f .env || test -f .env.development || { echo "Missing .env. Copy .env.example to .env and adjust the URLs." >&2; exit 1; }
	pnpm run start:live

build: check-shared-lib ## Build the production bundle into dist/
	pnpm run build

docker-build: ## Build the static nginx image $(IMAGE):$(IMAGE_TAG), taking the shared lib from SHARED_LIB_DIR
	@test -f "$(SHARED_LIB_DIR)/package.json" || { echo "Missing $(SHARED_LIB_DIR). Set SHARED_LIB_DIR to your rmu-react-shared-lib checkout." >&2; exit 1; }
	docker build --build-context shared-lib="$(SHARED_LIB_DIR)" -t $(IMAGE):$(IMAGE_TAG) .

docker-push: docker-build ## Build and push $(IMAGE):$(IMAGE_TAG) (for example IMAGE_TAG=1.2.0)
	docker push $(IMAGE):$(IMAGE_TAG)

# The shared lib is not published to npm: package.json declares it as link:$(SHARED_LIB_DIR), so
# `pnpm install` links the local checkout. Its dist/ has to be built first.
check-shared-lib:
	@test -e "node_modules/$(SHARED_LIB_NAME)/dist/index.js" || { echo "$(SHARED_LIB_NAME) is not built or installed. Run 'make link-shared-lib' first." >&2; exit 1; }

link-shared-lib: ## Build the local rmu-react-shared-lib checkout (SHARED_LIB_DIR) and install the link: dependency
	@test -f "$(SHARED_LIB_DIR)/package.json" || { echo "Missing $(SHARED_LIB_DIR). Set SHARED_LIB_DIR to your rmu-react-shared-lib checkout." >&2; exit 1; }
	@test -d "$(SHARED_LIB_DIR)/node_modules" || pnpm --dir "$(SHARED_LIB_DIR)" install --frozen-lockfile
	pnpm --dir "$(SHARED_LIB_DIR)" run build
	pnpm install
	@echo "Linked $(SHARED_LIB_NAME) from $(SHARED_LIB_DIR)."

create-release: ## Release develop to master with semantic-release (tag + CHANGELOG), push, and bump develop to next -SNAPSHOT. Optional RELEASE_BUMP=patch|minor|major
	@test "$$(git branch --show-current)" = "$(DEVELOP_BRANCH)" || { echo "Releases must start from '$(DEVELOP_BRANCH)' (current: $$(git branch --show-current))" >&2; exit 1; }
	@test -z "$$(git status --porcelain)" || { echo "Working directory is not clean:" >&2; git status --short >&2; exit 1; }
	git fetch --tags $(REMOTE)
	git pull --ff-only $(REMOTE) $(DEVELOP_BRANCH)
	git checkout $(MASTER_BRANCH) 2>/dev/null || git checkout -b $(MASTER_BRANCH) --track $(REMOTE)/$(MASTER_BRANCH)
	git pull --ff-only $(REMOTE) $(MASTER_BRANCH)
	git merge --no-ff --no-edit -m "Merge branch '$(DEVELOP_BRANCH)' into $(MASTER_BRANCH)" $(DEVELOP_BRANCH)
	@RELEASE_BUMP="$(RELEASE_BUMP)" pnpm exec semantic-release --no-ci \
		&& git describe --exact-match --tags HEAD >/dev/null 2>&1 \
		|| { echo "No release was created, restoring $(MASTER_BRANCH) and returning to $(DEVELOP_BRANCH)" >&2; \
			git reset -q --hard $(REMOTE)/$(MASTER_BRANCH); git checkout -q $(DEVELOP_BRANCH); exit 1; }
	git checkout $(DEVELOP_BRANCH)
	git merge --no-edit $(MASTER_BRANCH)
	@version=$$(node -p "require('./package.json').version"); \
		next=$$(pnpm exec semver -i patch "$$version")-SNAPSHOT; \
		pnpm pkg set version="$$next" \
		&& git commit -q -m "chore: prepare next development version $$next" package.json \
		&& echo "Released $$version, $(DEVELOP_BRANCH) is now at $$next"
	git push $(REMOTE) $(DEVELOP_BRANCH)
