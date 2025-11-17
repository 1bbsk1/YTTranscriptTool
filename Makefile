PYTHON ?= python

.PHONY: lint test typecheck format

lint:
	@echo "[lint] Running ruff..."
	@$(PYTHON) -m ruff check .

test:
	@echo "[test] Python tests not configured. Use npm test for TS suite."

typecheck:
	@echo "[typecheck] No Python type checker configured. Use npm run lint for TS type checks."

format:
	@echo "[format] No formatter configured yet. Add black/isort when ready."
