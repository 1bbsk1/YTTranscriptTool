PYTHON ?= python

.PHONY: lint test typecheck format

lint:
	@echo "[lint] Running ruff..."
	@$(PYTHON) -m ruff check .

test:
	@echo "[test] No tests configured yet. Add pytest or similar when ready."

typecheck:
	@echo "[typecheck] No type checker configured yet. Add mypy/pyright when ready."

format:
	@echo "[format] No formatter configured yet. Add black/isort when ready."
