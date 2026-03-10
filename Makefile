DOCKER_SHELL		:= /bin/ash

PROJECT_DIRECTORY	:= ./

QUIET				:= > /dev/null 2>&1

DOCKER_COMPOSE		:= $(shell \
	if docker compose version $(QUIET); \
		then \
		echo 'docker compose'; \
	elif docker-compose version $(QUIET); \
		then \
		echo 'docker-compose'; \
	fi) --project-directory $(PROJECT_DIRECTORY)

SERVICES			:= cotton-candy

COMPOSE_PROJECT_NAME:= cotton-candy

ifdef SERVICE
	SERVICES 		:= $(SERVICE)
endif

all:
	@make up SERVICES="$(SERVICES)" --no-print-directory

up:
	@BUILDKIT=1 $(DOCKER_COMPOSE) up -d $(SERVICES)

stop:
	@$(DOCKER_COMPOSE) stop $(SERVICES)

start:
	@$(DOCKER_COMPOSE) start $(SERVICES)

restart:
	@$(DOCKER_COMPOSE) restart $(SERVICES)

down:
	@$(DOCKER_COMPOSE) down $(SERVICES)

logs:
	@$(DOCKER_COMPOSE) logs --follow $(SERVICES)

build:
	@$(DOCKER_COMPOSE) build --no-cache $(SERVICES)

ps:
	@$(DOCKER_COMPOSE) ps --all $(SERVICES)

shell-%:
	@if docker ps | grep -w $* $(QUIET); \
	then \
		docker exec -it $* $(DOCKER_SHELL); \
	else \
		echo "image 'shell-$*' not found"; \
	fi

clean:
	@if docker image ls | grep $(COMPOSE_PROJECT_NAME) $(QUIET); \
	then \
		$(DOCKER_COMPOSE) down --timeout 1 --rmi local; \
	fi
	@if docker network ls | grep $(COMPOSE_PROJECT_NAME) $(QUIET); \
	then \
		$(DOCKER_COMPOSE) down --timeout 1 --rmi local; \
	fi

fclean: clean
	@if docker volume ls | grep $(COMPOSE_PROJECT_NAME) $(QUIET); \
	then \
		$(DOCKER_COMPOSE) down --timeout 1 --volumes;\
	fi

re: fclean all

prune:
	@docker system prune

.PHONY: all up stop start restart down logs build ps shell-% clean fclean re prune
