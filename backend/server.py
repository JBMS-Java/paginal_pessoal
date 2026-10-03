from __future__ import annotations

import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Iterator
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("DATA_DIR", ROOT / "backend" / "data"))
DATABASE_PATH = DATA_DIR / "site.sqlite3"
SESSION_COOKIE = "portfolio_admin"
SESSION_SECONDS = 12 * 60 * 60
MAX_BODY_BYTES = 32_768
MAX_NOTE_TEXT = 280
MAX_MESSAGE_TEXT = 3_000
ADMIN_PASSWORD = ""
SESSIONS: dict[str, float] = {}
MESSAGE_ATTEMPTS: dict[str, list[float]] = {}

CATEGORIES = {
    "react": "React",
    "javascript": "JavaScript",
    "css": "CSS",
    "html": "HTML",
    "python": "Python",
    "machine learning": "Machine Learning",
    "machine-learning": "Machine Learning",
    "inglês": "Inglês",
    "ingles": "Inglês",
    "espanhol": "Espanhol",
    "git": "Git",
    "php": "PHP",
    "sql": "SQL",
}


def load_local_environment() -> None:
    env_file = ROOT / ".env"
    if not env_file.is_file():
        return

    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip("\"'")
        os.environ.setdefault(key.strip(), value)


@contextmanager
def connect_database() -> Iterator[sqlite3.Connection]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode = WAL")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database() -> None:
    with connect_database() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY,
                word TEXT NOT NULL,
                body TEXT NOT NULL,
                categories TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )


def normalize_categories(value: object) -> list[str]:
    if not isinstance(value, list):
        value = [value]
    result: list[str] = []
    for item in value:
        if not isinstance(item, str):
            continue
        category = CATEGORIES.get(item.strip().casefold())
        if category and category not in result:
            result.append(category)
    return result


def serialize_note(row: sqlite3.Row) -> dict[str, object]:
    categories = json.loads(row["categories"])
    return {
        "id": row["id"],
        "palavra": row["word"],
        "nota": row["body"],
        "categorias": categories,
        "categoria": categories[0] if categories else "React",
        "criadaEm": row["created_at"],
    }


def save_note(note: object, *, allow_id: bool = False) -> int:
    if not isinstance(note, dict):
        raise ValueError("Nota inválida.")

    word = str(note.get("palavra", "")).strip()
    body = str(note.get("nota", "")).strip()
    categories = normalize_categories(note.get("categorias", note.get("categoria")))
    if not word or len(word) > 40:
        raise ValueError("A palavra deve ter entre 1 e 40 caracteres.")
    if not body or len(body) > MAX_NOTE_TEXT:
        raise ValueError("A nota deve ter entre 1 e 280 caracteres.")
    if not categories:
        raise ValueError("Selecione ao menos uma categoria válida.")

    supplied_id = note.get("id") if allow_id else None
    try:
        note_id = int(supplied_id) if supplied_id is not None else 0
    except (TypeError, ValueError) as error:
        raise ValueError("Identificador de nota inválido.") from error

    with connect_database() as connection:
        if note_id <= 0:
            latest_id = connection.execute("SELECT MAX(id) FROM notes").fetchone()[0] or 0
            note_id = max(time.time_ns() // 1_000_000, latest_id + 1)

        created_at = str(note.get("criadaEm") or "").strip()
        if not created_at and note_id > 10_000_000_000:
            created_at = datetime.fromtimestamp(note_id / 1000, timezone.utc).isoformat()
        if not created_at:
            created_at = datetime.now(timezone.utc).isoformat()
        connection.execute(
            """
            INSERT INTO notes (id, word, body, categories, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                word = excluded.word,
                body = excluded.body,
                categories = excluded.categories
            """,
            (note_id, word, body, json.dumps(categories), created_at),
        )
    return note_id


class PortfolioHandler(BaseHTTPRequestHandler):
    server_version = "PortfolioBackend/1.0"

    def log_message(self, format_string: str, *args: object) -> None:
        print(f"{self.address_string()} - {format_string % args}")

    def send_json(
        self,
        status: int,
        payload: object,
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if extra_headers:
            for name, value in extra_headers.items():
                self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> object:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Tamanho de requisição inválido.") from error
        if length <= 0 or length > MAX_BODY_BYTES:
            raise ValueError("O conteúdo enviado é inválido ou muito grande.")
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ValueError("JSON inválido.") from error

    def is_admin(self) -> bool:
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get("Cookie", ""))
            token = cookie[SESSION_COOKIE].value
        except Exception:
            return False

        expires_at = SESSIONS.get(token)
        if not expires_at or expires_at < time.time():
            SESSIONS.pop(token, None)
            return False
        return True

    def require_admin(self) -> bool:
        if self.is_admin():
            return True
        self.send_json(401, {"error": "Acesso restrito."})
        return False

    def do_GET(self) -> None:
        path = urlsplit(self.path).path
        if path == "/api/health":
            self.send_json(200, {"status": "ok"})
        elif path == "/api/session":
            self.send_json(200, {"authenticated": self.is_admin()})
        elif path == "/api/notes":
            with connect_database() as connection:
                rows = connection.execute(
                    "SELECT * FROM notes ORDER BY id DESC"
                ).fetchall()
            self.send_json(200, [serialize_note(row) for row in rows])
        elif path == "/api/messages":
            if not self.require_admin():
                return
            with connect_database() as connection:
                rows = connection.execute(
                    "SELECT * FROM messages ORDER BY id DESC LIMIT 200"
                ).fetchall()
            messages = [
                {
                    "id": row["id"],
                    "nome": row["name"],
                    "email": row["email"],
                    "mensagem": row["body"],
                    "criadaEm": row["created_at"],
                }
                for row in rows
            ]
            self.send_json(200, messages)
        else:
            self.serve_static(path)

    def do_POST(self) -> None:
        path = urlsplit(self.path).path
        try:
            payload = self.read_json()
            if not isinstance(payload, dict):
                raise ValueError("O conteúdo enviado é inválido.")
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        if path == "/api/admin/login":
            password = payload.get("password", "")
            password_bytes = password.encode("utf-8") if isinstance(password, str) else b""
            expected_bytes = ADMIN_PASSWORD.encode("utf-8")
            if not hmac.compare_digest(password_bytes, expected_bytes):
                self.send_json(401, {"error": "Senha incorreta."})
                return

            token = secrets.token_urlsafe(32)
            SESSIONS[token] = time.time() + SESSION_SECONDS
            secure = "; Secure" if os.environ.get("COOKIE_SECURE") == "1" else ""
            self.send_json(
                200,
                {"authenticated": True},
                {
                    "Set-Cookie": (
                        f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; SameSite=Strict; "
                        f"Max-Age={SESSION_SECONDS}{secure}"
                    )
                },
            )
        elif path == "/api/admin/logout":
            cookie = SimpleCookie()
            cookie.load(self.headers.get("Cookie", ""))
            token = cookie.get(SESSION_COOKIE)
            if token:
                SESSIONS.pop(token.value, None)
            self.send_json(
                200,
                {"authenticated": False},
                {"Set-Cookie": f"{SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"},
            )
        elif path == "/api/notes":
            if not self.require_admin():
                return
            try:
                note_id = save_note(payload)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            self.send_json(201, {"id": note_id})
        elif path == "/api/notes/import":
            if not self.require_admin():
                return
            notes = payload.get("notes")
            if not isinstance(notes, list) or len(notes) > 500:
                self.send_json(400, {"error": "A lista de notas não é válida."})
                return
            imported = 0
            try:
                for note in notes:
                    save_note(note, allow_id=True)
                    imported += 1
            except ValueError as error:
                self.send_json(400, {"error": str(error), "importadas": imported})
                return
            self.send_json(200, {"importadas": imported})
        elif path == "/api/messages":
            self.save_message(payload)
        else:
            self.send_json(404, {"error": "Rota não encontrada."})

    def do_DELETE(self) -> None:
        path = urlsplit(self.path).path
        if not self.require_admin():
            return

        note_match = re.fullmatch(r"/api/notes/(\d+)", path)
        message_match = re.fullmatch(r"/api/messages/(\d+)", path)
        if note_match:
            table, item_id = "notes", int(note_match.group(1))
        elif message_match:
            table, item_id = "messages", int(message_match.group(1))
        else:
            self.send_json(404, {"error": "Rota não encontrada."})
            return

        with connect_database() as connection:
            result = connection.execute(f"DELETE FROM {table} WHERE id = ?", (item_id,))
        if result.rowcount == 0:
            self.send_json(404, {"error": "Registro não encontrado."})
            return
        self.send_json(200, {"deleted": True})

    def save_message(self, payload: dict[str, object]) -> None:
        ip_address = self.client_address[0]
        now = time.time()
        attempts = [
            attempt
            for attempt in MESSAGE_ATTEMPTS.get(ip_address, [])
            if now - attempt < 600
        ]
        if len(attempts) >= 5:
            self.send_json(429, {"error": "Muitas mensagens. Tente novamente mais tarde."})
            return

        name = str(payload.get("nome", "")).strip()
        email = str(payload.get("email", "")).strip()
        body = str(payload.get("mensagem", "")).strip()
        if payload.get("website"):
            self.send_json(200, {"received": True})
            return
        if len(name) < 3 or len(name) > 100:
            self.send_json(400, {"error": "Informe um nome entre 3 e 100 caracteres."})
            return
        if len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
            self.send_json(400, {"error": "Informe um e-mail válido."})
            return
        if len(body) < 10 or len(body) > MAX_MESSAGE_TEXT:
            self.send_json(400, {"error": "A mensagem deve ter entre 10 e 3000 caracteres."})
            return

        attempts.append(now)
        MESSAGE_ATTEMPTS[ip_address] = attempts
        created_at = datetime.now(timezone.utc).isoformat()
        with connect_database() as connection:
            cursor = connection.execute(
                "INSERT INTO messages (name, email, body, created_at) VALUES (?, ?, ?, ?)",
                (name, email, body, created_at),
            )
            message_id = cursor.lastrowid
        self.send_json(201, {"received": True, "id": message_id})

    def serve_static(self, request_path: str) -> None:
        relative = unquote(request_path).lstrip("/") or "index.html"
        target = (ROOT / relative).resolve()
        allowed_roots = {"index.html", "estilos", "icones", "imagens", "javascript"}
        first_part = Path(relative).parts[0] if Path(relative).parts else ""
        if (
            first_part not in allowed_roots
            or not target.is_relative_to(ROOT)
            or not target.is_file()
            or any(part.startswith(".") for part in Path(relative).parts)
        ):
            self.send_json(404, {"error": "Arquivo não encontrado."})
            return

        content = target.read_bytes()
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {
            "application/javascript",
            "application/json",
        }:
            content_type += "; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(content)


def main() -> None:
    global ADMIN_PASSWORD
    load_local_environment()
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
    if len(ADMIN_PASSWORD) < 12:
        raise SystemExit("Configure ADMIN_PASSWORD com pelo menos 12 caracteres no arquivo .env.")

    initialize_database()
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), PortfolioHandler)
    print(f"Site e API disponíveis em http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()