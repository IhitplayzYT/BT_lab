"""Start the optional FastAPI assistant as a detached local Python process."""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import venv
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "ai-assistant"
VENV_DIR = APP_DIR / ".venv"
PID_FILE = Path(tempfile.gettempdir()) / "uno-ai-assistant.pid"
LOG_FILE = Path(tempfile.gettempdir()) / "uno-ai-assistant.log"
INSTALL_LOG = Path(tempfile.gettempdir()) / "uno-ai-assistant-install.log"
DEFAULT_JWT_SECRET = "test-secret-key-minimum-32-characters-for-hmac256"


def load_root_env() -> dict[str, str]:
    values: dict[str, str] = {}
    env_file = ROOT / ".env"
    if not env_file.exists():
        return values
    for raw_line in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        values[key] = value
    return values


def assistant_environment() -> dict[str, str]:
    env = os.environ.copy()
    root_env = load_root_env()
    defaults = {
        "JWT_SECRET": DEFAULT_JWT_SECRET,
        "JWT_ISSUER": "fd-platform-auth",
        "OLLAMA_BASE_URL": "http://127.0.0.1:11434",
        "OLLAMA_MODEL": "llama3.2",
        "ASSISTANT_ALLOWED_ORIGINS": "http://localhost:4200,http://localhost:4000",
    }
    for key, default in defaults.items():
        if not env.get(key):
            env[key] = root_env.get(key, default)
    env["PIP_DEFAULT_TIMEOUT"] = "15"
    return env


def api_is_running() -> bool:
    try:
        with urllib.request.urlopen("http://127.0.0.1:8091/openapi.json", timeout=1) as response:
            return response.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def python_in_venv() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def ensure_dependencies() -> Path:
    python_path = python_in_venv()
    if not python_path.exists():
        venv.EnvBuilder(with_pip=True).create(VENV_DIR)
    check = subprocess.run(
        [str(python_path), "-c", "import fastapi, httpx, jwt, uvicorn"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if check.returncode == 0:
        return python_path
    with INSTALL_LOG.open("w", encoding="utf-8") as log:
        install = subprocess.run(
            [str(python_path), "-m", "pip", "install", "--disable-pip-version-check", "-r", str(APP_DIR / "requirements.txt")],
            stdout=log,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=180,
            env=assistant_environment(),
        )
    if install.returncode != 0:
        raise RuntimeError(f"Python dependency installation failed; see {INSTALL_LOG}")
    return python_path


def launch() -> int:
    if api_is_running():
        print("AI assistant API is already running at http://localhost:8091")
        return 0

    python_path = ensure_dependencies()
    args = [str(python_path), "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8091"]
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as log:
        options: dict[str, object] = {
            "cwd": APP_DIR,
            "env": assistant_environment(),
            "stdout": log,
            "stderr": subprocess.STDOUT,
            "close_fds": True,
        }
        if os.name == "nt":
            options["creationflags"] = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            options["start_new_session"] = True
        process = subprocess.Popen(args, **options)

    PID_FILE.write_text(str(process.pid), encoding="ascii")
    for _ in range(30):
        if api_is_running():
            print(f"AI assistant API started locally (PID {process.pid}) at http://localhost:8091")
            print("It uses your local Ollama server and llama3.2; the tabs show Service unavailable until that model responds.")
            return 0
        if process.poll() is not None:
            raise RuntimeError(f"AI assistant exited during startup; see {LOG_FILE}")
        time.sleep(0.5)
    raise RuntimeError(f"AI assistant did not become ready; see {LOG_FILE}")


if __name__ == "__main__":
    try:
        raise SystemExit(launch())
    except Exception as exc:
        print(f"Optional AI assistant startup failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
