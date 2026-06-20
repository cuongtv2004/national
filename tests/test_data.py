"""Kiểm thử dữ liệu (không cần thư viện ngoài).

Chạy:  python3 -m unittest discover tests
   hoặc: python3 tests/test_data.py
"""
import json
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


class TestCountriesDataset(unittest.TestCase):
    def setUp(self):
        self.wc = load("countries.json")

    def test_is_list_with_cca2(self):
        self.assertIsInstance(self.wc, list)
        self.assertGreater(len(self.wc), 200)
        for c in self.wc:
            self.assertIn("cca2", c)


class TestVietnameseNames(unittest.TestCase):
    def setUp(self):
        self.vi = load("countries-vi.json")
        self.codes = {c["cca2"] for c in load("countries.json") if c.get("cca2")}

    def test_keys_are_valid_iso2_and_known(self):
        for code, name in self.vi.items():
            self.assertRegex(code, r"^[A-Z]{2}$", f"mã ISO lạ: {code}")
            self.assertTrue(name and name.strip(), f"tên rỗng: {code}")
            self.assertIn(code, self.codes, f"mã không có trong dataset: {code}")

    def test_reasonable_count(self):
        self.assertGreaterEqual(len(self.vi), 150)


class TestExtraContent(unittest.TestCase):
    def setUp(self):
        self.extra = load("countries-extra.json")
        self.vi = load("countries-vi.json")

    def test_schema(self):
        for code, o in self.extra.items():
            self.assertIn(code, self.vi, f"{code} có extra nhưng không có tên VI")
            if "tourism" in o:
                self.assertIsInstance(o["tourism"], list)
            if "food" in o:
                self.assertIsInstance(o["food"], list)
            if "funFacts" in o:
                self.assertIsInstance(o["funFacts"], list)
            if "culture" in o:
                self.assertIsInstance(o["culture"], str)

    def test_flag_meaning_covers_all_vi_countries(self):
        # Mọi nước có tên tiếng Việt nên có ý nghĩa lá cờ.
        missing = [c for c in self.vi if not self.extra.get(c, {}).get("flagMeaning")]
        self.assertEqual(missing, [], f"thiếu flagMeaning: {missing}")


class TestContinents(unittest.TestCase):
    def test_structure(self):
        conts = load("continents-vi.json")
        self.assertGreaterEqual(len(conts), 5)
        for c in conts:
            for key in ("key", "nameVi", "slug", "color", "emoji"):
                self.assertIn(key, c)
            self.assertRegex(c["color"], r"^#[0-9A-Fa-f]{6}$")


class TestTwinFlags(unittest.TestCase):
    def test_pairs_reference_known_countries(self):
        vi = load("countries-vi.json")
        twins = load("twin-flags.json")
        self.assertGreater(len(twins), 0)
        for p in twins:
            for key in ("a", "b", "note"):
                self.assertIn(key, p)
            self.assertIn(p["a"], vi, f"mã lạ: {p['a']}")
            self.assertIn(p["b"], vi, f"mã lạ: {p['b']}")
            self.assertTrue(p["note"].strip())


class TestWorldAtlas(unittest.TestCase):
    def test_topojson_ids_match_ccn3(self):
        topo = load("countries-110m.json")
        self.assertEqual(topo.get("type"), "Topology")
        geos = topo["objects"]["countries"]["geometries"]
        ccn3 = {c.get("ccn3") for c in load("countries.json") if c.get("ccn3")}
        matched = sum(1 for g in geos if g.get("id") in ccn3)
        # Phần lớn quốc gia trên bản đồ phải khớp mã ccn3 để tô màu được.
        self.assertGreater(matched, len(geos) * 0.9)


if __name__ == "__main__":
    unittest.main(verbosity=2)
