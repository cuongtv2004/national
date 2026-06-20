"""Kiểm thử đầu-cuối bằng Playwright: mở từng trang, bắt lỗi Console.

Cài 1 lần:  pip install playwright && python3 -m playwright install chromium
Chạy:       python3 -m unittest tests.test_e2e
Tự bỏ qua nếu chưa cài Playwright.
"""
import os
import socket
import subprocess
import time
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    from playwright.sync_api import sync_playwright

    HAS_PW = True
except Exception:
    HAS_PW = False

# (đường dẫn hash, selector kỳ vọng)
ROUTES = [
    ("/", "h1"),
    ("/#/ban-do", "svg, canvas"),
    ("/#/kham-pha", "input"),
    ("/#/quoc-gia/vn", "h1"),
    ("/#/thu-thach", "a[href*='thu-thach/']"),
    ("/#/thu-thach/doan-co", "button"),
    ("/#/thu-thach/ban-do", "svg"),
    ("/#/thu-thach/lat-the", "button"),
    ("/#/bo-suu-tap", "h1"),
    ("/#/co-song-sinh", "h1"),
]


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


@unittest.skipUnless(HAS_PW, "Chưa cài Playwright — bỏ qua test E2E")
class TestPages(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = free_port()
        cls.srv = subprocess.Popen(
            ["python3", "-m", "http.server", str(cls.port), "--directory", ROOT],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        # đợi server sẵn sàng
        for _ in range(50):
            try:
                socket.create_connection(("127.0.0.1", cls.port), timeout=0.3).close()
                break
            except OSError:
                time.sleep(0.1)
        cls.base = f"http://127.0.0.1:{cls.port}"
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.srv.terminate()

    def _check(self, path, selector):
        page = self.browser.new_page(viewport={"width": 1100, "height": 850})
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append("PAGEERR: " + str(e)))
        try:
            page.goto(self.base + path, wait_until="load", timeout=30000)
            ok = False
            for sel in selector.split(", "):
                try:
                    page.wait_for_selector(sel, timeout=8000, state="attached")
                    ok = True
                    break
                except Exception:
                    continue
            page.wait_for_timeout(2500)  # chờ tải dữ liệu/CDN
            self.assertTrue(ok, f"{path}: không thấy phần tử '{selector}'")
            self.assertEqual(errors, [], f"{path}: có lỗi console {errors[:4]}")
        finally:
            page.close()

    def test_routes(self):
        for path, sel in ROUTES:
            with self.subTest(route=path):
                self._check(path, sel)


if __name__ == "__main__":
    unittest.main(verbosity=2)
