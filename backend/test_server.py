import http.cookiejar
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import patch
from http.server import ThreadingHTTPServer

import server


class BackendApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.data_dir = Path(self.temp_dir.name)
        self.data_patch = patch.object(server, "DATA_DIR", self.data_dir)
        self.database_patch = patch.object(server, "DATABASE_PATH", self.data_dir / "test.sqlite3")
        self.password_patch = patch.object(server, "ADMIN_PASSWORD", "test-admin-password-2026")
        self.data_patch.start()
        self.database_patch.start()
        self.password_patch.start()
        server.SESSIONS.clear()
        server.MESSAGE_ATTEMPTS.clear()
        server.initialize_database()

        self.http_server = ThreadingHTTPServer(("127.0.0.1", 0), server.PortfolioHandler)
        self.thread = threading.Thread(target=self.http_server.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.http_server.server_port}"
        self.cookies = http.cookiejar.CookieJar()
        self.client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))

    def tearDown(self) -> None:
        self.http_server.shutdown()
        self.http_server.server_close()
        self.thread.join(timeout=2)
        self.password_patch.stop()
        self.database_patch.stop()
        self.data_patch.stop()
        self.temp_dir.cleanup()

    def request(self, path: str, method: str = "GET", payload: object | None = None):
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = urllib.request.Request(
            self.base_url + path,
            data=body,
            headers={"Content-Type": "application/json"} if body is not None else {},
            method=method,
        )
        try:
            response = self.client.open(request)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.code, json.loads(response.read().decode("utf-8"))

    def test_notes_are_public_and_writes_require_admin(self) -> None:
        status, _ = self.request("/api/notes", "POST", {
            "palavra": "Fetch", "nota": "Requisições", "categorias": ["JavaScript", "React"]
        })
        self.assertEqual(status, 401)

        status, _ = self.request("/api/admin/login", "POST", {"password": "test-admin-password-2026"})
        self.assertEqual(status, 200)
        status, result = self.request("/api/notes", "POST", {
            "palavra": "Fetch", "nota": "Requisições", "categorias": ["JavaScript", "React"]
        })
        self.assertEqual(status, 201)

        status, notes = self.request("/api/notes")
        self.assertEqual(status, 200)
        self.assertEqual(notes[0]["categorias"], ["JavaScript", "React"])
        self.assertEqual(notes[0]["id"], result["id"])

    def test_legacy_note_import_preserves_its_timestamp(self) -> None:
        self.request("/api/admin/login", "POST", {"password": "test-admin-password-2026"})
        status, _ = self.request("/api/notes/import", "POST", {
            "notes": [{
                "id": 1791058404956,
                "palavra": "useState",
                "nota": "Hook para estado",
                "categorias": ["React", "JavaScript"],
            }]
        })
        self.assertEqual(status, 200)
        _, notes = self.request("/api/notes")
        self.assertTrue(notes[0]["criadaEm"].startswith("2026-10-03"))

    def test_contact_messages_are_saved_and_private(self) -> None:
        status, saved = self.request("/api/messages", "POST", {
            "nome": "Joana", "email": "joana@example.com", "mensagem": "Olá, gostaria de conversar."
        })
        self.assertEqual(status, 201)
        status, _ = self.request("/api/messages")
        self.assertEqual(status, 401)

        self.request("/api/admin/login", "POST", {"password": "test-admin-password-2026"})
        status, messages = self.request("/api/messages")
        self.assertEqual(status, 200)
        self.assertEqual(messages[0]["id"], saved["id"])
        self.assertEqual(messages[0]["email"], "joana@example.com")


if __name__ == "__main__":
    unittest.main()