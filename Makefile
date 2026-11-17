.PHONY: help install dev-backend dev-frontend test seed clean cli-queue

help:
	@echo "OpsDesk Development Commands:"
	@echo "  make install       Install python requirements"
	@echo "  make seed          Reseed local development database (5,000 tickets)"
	@echo "  make dev-backend   Start FastAPI development server on port 8000"
	@echo "  make dev-frontend  Start Next.js frontend development server on port 3000"
	@echo "  make test          Run pytest suite on backend contracts"
	@echo "  make cli-queue     Run terminal operations queue inspector"

install:
	pip install -r requirements.txt
	cd frontend && npm install

seed:
	python -m backend.seed.seed_data --reset

dev-backend:
	uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

test:
	pytest backend/tests -v

cli-queue:
	python scripts/opsdesk_cli.py queue --limit 10
