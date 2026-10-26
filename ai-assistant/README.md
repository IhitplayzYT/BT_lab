# Optional UNO customer assistant

This is a separate, non-critical FastAPI service. It accepts one message per request, verifies the signed-in customer's HS256 JWT, and calls a local Ollama `llama3.2` model with customer-facing banking context. It does not query banking services or store chat history.

The customer dashboard also has an FD Advisor tab. It sends only structured goals and requirements, current portfolio product/amount/term/status fields, and the active product catalog. Account numbers, customer identity, credentials, and other account identifiers are excluded. Recommendations are general product comparisons, not transactions or guaranteed returns.

## Run locally

`start_all.sh` and `start_all.ps1` launch the Python API as a detached local process after the banking services. They create an isolated Python virtual environment and install `requirements.txt` if needed. Startup and dependency errors are non-fatal to banking and frontend startup. The API binds to `127.0.0.1:8091` and uses the Ollama server already running on the PC at `http://127.0.0.1:11434`; it does not start Ollama or download models. Make sure Ollama is running and `llama3.2` is installed. Until the API and model respond, the customer tabs show **Service unavailable** and offer **Try again**.

To start it manually from the repository root, run `python ai-assistant/start_local.py` (or `python3` on Linux). The launcher reads `JWT_SECRET` and `JWT_ISSUER` from the process environment or root `.env`, matching the Auth service configuration. It uses the Compose development defaults if those values are not configured. Set `ASSISTANT_ALLOWED_ORIGINS` if the Angular frontends use different origins. API output is written to the system temporary directory as `uno-ai-assistant.log`.

The chat endpoint is `POST http://localhost:8091/api/assistant/chat`, requires `Authorization: Bearer <customer access token>`, and accepts `{ "message": "..." }`. The advisor endpoint is `POST http://localhost:8091/api/assistant/advisor` and uses the same customer authentication. The admin Relation Nets can request `POST /api/assistant/risk-insight` with an administrator or bank-officer token; it accepts only aggregate graph counts and flags and returns an AI explanation alongside the deterministic graph score. Customer and nominee names, account numbers, and node IDs are not sent to the model. Missing configuration or Ollama returns HTTP 503; invalid authentication returns 401 and unauthorized roles return 403. The Python service is not part of Docker Compose.

The assistant currently has no maintained automated test suite. Core API availability depends on the local Python environment, Ollama service and configured model; use the endpoint behavior above for manual checks.
