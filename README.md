# 🌍 Cờ Các Nước

Trang web vui nhộn giúp các bạn nhỏ (6–12 tuổi) **khám phá và học về cờ các quốc gia** trên thế giới — vừa chơi, vừa học, vừa luyện tiếng Anh.

## ✨ Tính năng

- **Khám phá**: xem ~190 lá cờ, tìm kiếm (gõ không dấu vẫn ra), lọc theo châu lục.
- **Chi tiết quốc gia**: cờ lớn, tên Việt / Anh / tên người (Vietnamese) kèm nút 🔊 **phát âm tiếng Anh**, thông tin thủ đô – châu lục – diện tích, và các mục **Du lịch / Văn hóa / Ẩm thực / Bạn có biết không?**.
- **Trò chơi đố cờ** với 3 chế độ:
  - 🚩 Xem cờ → đoán tên tiếng Việt
  - 🔤 Xem tên → chọn đúng lá cờ
  - 🇬🇧 Xem cờ → đoán tên **tiếng Anh** (có đọc to đáp án)
- **Sao & huy hiệu** lưu lại trong máy (localStorage).

## 🛠️ Công nghệ — Không cần cài đặt gì (no-build)

Toàn bộ chạy bằng **ES Modules + CDN** ngay trong trình duyệt, **không cần Node.js, không npm, không build**:

| Phần | Nguồn |
|---|---|
| React + ReactDOM | esm.sh |
| Routing | react-router-dom (HashRouter) |
| Giao diện | Tailwind Play CDN |
| JSX không cần build | thư viện `htm` |
| Dữ liệu quốc gia | `data/countries.json` (bộ dữ liệu mở mledoze/countries) |
| Ảnh cờ | flagcdn.com |
| Phát âm | Web Speech API (có sẵn trong trình duyệt) |

## ▶️ Chạy thử trên máy

Cần một máy chủ tĩnh đơn giản (KHÔNG mở trực tiếp `index.html` bằng `file://` vì ES modules + fetch sẽ bị chặn). Dùng Python có sẵn:

```bash
cd national
python3 -m http.server 8000
```

Rồi mở trình duyệt: **http://localhost:8000**

## 🚀 Đưa lên GitHub Pages (không cần build)

1. Đẩy code lên GitHub (nhánh `main`):
   ```bash
   git add .
   git commit -m "Cờ Các Nước"
   git push
   ```
2. Vào repo trên GitHub → **Settings → Pages**.
3. Mục **Source** chọn **Deploy from a branch** → branch `main`, thư mục `/ (root)` → **Save**.
4. Đợi ~30 giây, web sẽ chạy tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

> Vì dùng `HashRouter`, các đường dẫn có dạng `.../#/kham-pha` nên không bị lỗi 404 khi tải lại trang.
> Những lần sau chỉ cần `git push` là trang tự cập nhật — không cần build, không cần cài gì.

## 📁 Cấu trúc

```
national/
├── index.html          # nạp CDN + import maps
├── styles.css          # màu sắc & hiệu ứng
├── data/               # countries.json + tên tiếng Việt + nội dung văn hóa
└── src/
    ├── main.js         # gốc app + định tuyến
    ├── data.js         # nạp & ghép dữ liệu
    ├── context.js      # cung cấp dữ liệu cho toàn app
    ├── components/     # Navbar, FlagCard, HeroSection, QuizCard, ...
    ├── pages/          # Home, Gallery, CountryDetail, Quiz
    └── utils/          # tìm kiếm không dấu, phát âm, điểm số
```

## 🧪 Kiểm thử (tests)

Thư mục `tests/` có sẵn bộ kiểm thử bằng Python:

```bash
# Kiểm thử dữ liệu (chỉ cần Python, không cần cài gì)
python3 -m unittest tests.test_data

# Kiểm thử đầu-cuối các trang (cần Playwright; tự bỏ qua nếu chưa cài)
pip install playwright && python3 -m playwright install chromium
python3 -m unittest tests.test_e2e

# Chạy tất cả
python3 -m unittest discover tests
```

- `test_data.py` — kiểm tra các file JSON: đúng schema, mã quốc gia hợp lệ, mọi nước có ý nghĩa lá cờ, cặp cờ song sinh hợp lệ, id bản đồ khớp ccn3.
- `test_e2e.py` — tự bật server tĩnh, mở từng trang bằng trình duyệt và đảm bảo **không có lỗi Console**.

## 📝 Lịch sử thay đổi

Xem [CHANGELOG.md](CHANGELOG.md) để biết các phiên bản và thay đổi.

## ➕ Thêm nội dung cho một quốc gia

- Tên tiếng Việt: thêm vào `data/countries-vi.json` (`"mã ISO": "Tên"`).
- Du lịch/văn hóa/ẩm thực/sự thật: thêm vào `data/countries-extra.json`.

Hiện đã có ~190 tên tiếng Việt và nội dung chi tiết cho 29 quốc gia phổ biến — có thể bổ sung dần.
