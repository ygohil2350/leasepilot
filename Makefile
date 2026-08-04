.PHONY: up down dev dev-down logs test build seed
up:
	docker compose up --build -d
down:
	docker compose down
dev:
	docker compose -f docker-compose.dev.yml up --build
dev-down:
	docker compose -f docker-compose.dev.yml down
logs:
	docker compose logs -f
test:
	npm test
build:
	npm run build
seed:
	docker compose exec api npm run seed
