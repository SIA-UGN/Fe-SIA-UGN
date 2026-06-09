SHELL := /bin/bash

.PHONY: dev build deploy logs clean

dev:
	docker compose up --build -d

build:
	docker compose build

deploy:
	docker compose pull
	docker compose up -d --remove-orphans

logs:
	docker compose logs -f

clean:
	docker compose down --remove-orphans
