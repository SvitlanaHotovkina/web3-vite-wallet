# Variables
DOCKER_COMPOSE = docker-compose
DOCKER = docker

# Starts the application in Docker
start:
	$(DOCKER_COMPOSE) up --build

# Stops the container
stop:
	$(DOCKER_COMPOSE) down


# Cleans up cache
clean:
	sudo rm -rf ./dist
	$(DOCKER) volume prune -a
	$(DOCKER) system prune -a

# Reinstalls dependencies from scratch
reinstall:
	rm -rf ./node_modules ./package-lock.json
	npm install

# Shows logs from the container
logs:
	$(DOCKER_COMPOSE) logs -f

# Shows version build front
title:
	$(DOCKER) exec scalping_frontend ls -lah /  # Папка, где собранный фронтенд
	$(DOCKER) exec scalping_frontend cat /app/build/index.html | grep "title"

show:
	$(DOCKER) exec -it scalping_frontend sh

