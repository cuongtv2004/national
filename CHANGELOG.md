# Changelog

Toàn bộ thay đổi đáng chú ý của dự án **Cờ Các Nước** được ghi lại tại đây.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/),
và dự án tuân theo [Semantic Versioning](https://semver.org/lang/vi/).

## [1.2.1] - 2026-06-20

### Đã sửa
- Tối ưu hiển thị trên điện thoại: tên quốc gia dài và số liệu tự xuống dòng (`break-words`), cỡ chữ tiêu đề và số liệu nhỏ lại hợp lý ở màn hình hẹp.

## [1.2.0] - 2026-06-20

### Đã thêm
- Mở rộng nội dung chi tiết từ **29 → 190 quốc gia** (phủ 100% các nước có tên tiếng Việt).
- Mỗi quốc gia có đủ: địa danh du lịch, mô tả văn hóa, từ khóa ảnh văn hóa, món ăn đặc trưng và các sự thật thú vị.
- Nội dung được soạn riêng cho trẻ 6–12 tuổi, tập trung thiên nhiên, ẩm thực, kỳ quan; các nước nhạy cảm được xử lý tế nhị (chỉ nêu di sản, thiên nhiên, món ăn).

## [1.1.0] - 2026-06-20

### Đã thêm
- Hình ảnh minh họa cho các mục **Du lịch / Ẩm thực / Văn hóa** ở trang chi tiết quốc gia.
- Component `ImageCard`: hiện khung chờ (skeleton) khi tải, ảnh khi có, và emoji dự phòng khi không tìm thấy.
- Lấy ảnh tự động từ **Wikipedia tiếng Việt** theo tên (CORS sẵn, không cần khóa API).
- Bộ nhớ đệm ảnh (bộ nhớ + `sessionStorage`) để không tải lại nhiều lần.
- Trường `cultureImage` trong dữ liệu để chọn ảnh đại diện cho văn hóa từng nước.
- Ghi nguồn ảnh Wikipedia ở chân trang.

### Đã gỡ
- Component `Chips` cũ (thay bằng lưới ảnh).

## [1.0.0] - 2026-06-20

### Đã thêm
- Khởi tạo website **Cờ Các Nước** theo kiến trúc **no-build** (không cần Node.js/npm): React + htm + react-router qua CDN, Tailwind Play CDN.
- **Trang chủ**: hero với hiệu ứng "mưa cờ" trên canvas, lá cờ bí ẩn hàng ngày, lưới cờ nổi bật và lưới châu lục.
- **Khám phá**: gallery ~190 lá cờ, tìm kiếm không dấu, lọc theo châu lục, trạng thái rỗng thân thiện.
- **Chi tiết quốc gia**: cờ lớn, 3 dòng tên (Việt / Anh / tên người Anh) kèm nút 🔊 phát âm tiếng Anh, thông tin thủ đô – châu lục – diện tích.
- **Trò chơi đố cờ** với 3 chế độ: Cờ → tên tiếng Việt, Tên → chọn cờ, Cờ → tên tiếng Anh (có đọc to đáp án).
- Hệ thống **sao và huy hiệu** lưu trong `localStorage`.
- Dữ liệu quốc gia tĩnh từ bộ dữ liệu mở `mledoze/countries`; ảnh cờ từ `flagcdn.com` (kèm dự phòng emoji khi ảnh lỗi).
- Phát âm tiếng Anh bằng Web Speech API (tự bỏ qua nếu trình duyệt không hỗ trợ).
- Hỗ trợ truy cập: `alt` cho ảnh, điều hướng bàn phím, `prefers-reduced-motion`, vùng chạm ≥ 48px.
- Cấu hình sẵn cho **GitHub Pages**: `HashRouter` + `.nojekyll`.
- `README.md` hướng dẫn chạy local và triển khai.

[1.2.1]: https://github.com/cuongtv2004/national/releases/tag/v1.2.1
[1.2.0]: https://github.com/cuongtv2004/national/releases/tag/v1.2.0
[1.1.0]: https://github.com/cuongtv2004/national/releases/tag/v1.1.0
[1.0.0]: https://github.com/cuongtv2004/national/releases/tag/v1.0.0
