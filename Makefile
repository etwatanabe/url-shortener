DOCKER_COMPOSE = docker compose
ENV = .env.local

ifeq ($(OS),Windows_NT)
help: ## Available commands
	@findstr /R /C:"^[a-zA-Z0-9_-]*:.*##" $(MAKEFILE_LIST) | powershell -Command "$$input | foreach { if ($$_ -match '^([a-zA-Z0-9_-]+):.*## (.*)') { Write-Host (' make {0,-20} => {1}' -f $$matches[1], $$matches[2]) -ForegroundColor Cyan } }"
else
help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
endif

up: ## Start all services with Docker Compose
	@echo "Starting all services with Docker Compose..."
	$(DOCKER_COMPOSE) -f docker-compose.yml --env-file $(ENV) up -d --build

down: ## Stop and remove containers
	@echo "Stopping and removing containers..."
	$(DOCKER_COMPOSE) -f docker-compose.yml --env-file $(ENV) down

clean: ## Remove all Docker containers, volumes and networks (!)
	@echo "Removing volumes and networks..."
	$(DOCKER_COMPOSE) -f docker-compose.yml --env-file $(ENV) down --volumes --remove-orphans
	@docker volume prune -f
	@docker network prune -f