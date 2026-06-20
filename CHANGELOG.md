# Changelog

Toàn bộ thay đổi đáng chú ý của dự án **Cờ Các Nước** được ghi lại tại đây.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/),
và dự án tuân theo [Semantic Versioning](https://semver.org/lang/vi/).

## [1.7.0] - 2026-06-20

### Đã thêm
- **Quả địa cầu 3D** 🌐 trong trang Bản đồ: nút chuyển giữa "Bản đồ phẳng" và "Quả địa cầu". Quả cầu tự quay nhẹ, kéo để xoay bằng tay, chạm vào một quốc gia để xem tên và mở chi tiết. Vẽ bằng canvas + d3-geo (orthographic), vẫn no-build.

## [1.6.0] - 2026-06-20

### Đã thêm
- **Ý nghĩa lá cờ**: trang chi tiết mỗi quốc gia có mục giải thích màu sắc/biểu tượng trên lá cờ (cho cả 190 nước), viết đơn giản cho trẻ.
- **Cờ song sinh** (`/co-song-sinh`): bộ sưu tập các cặp cờ trông giống nhau (Indonesia–Monaco, Tchad–Romania, Na Uy–Iceland...) kèm cách phân biệt; có lối vào từ trang chủ.

## [1.5.0] - 2026-06-20

### Đã thêm
- **Trang Trò chơi** (hub) gom các trò chơi học cờ.
- Trò **Tìm trên bản đồ**: hiện tên nước, bé bấm đúng vị trí trên bản đồ thế giới.
- Trò **Lật thẻ ghi nhớ**: ghép cặp lá cờ ↔ tên nước (memory match).
- **Sổ tay sưu tập** (`/bo-suu-tap`): theo dõi cờ đã xem/đoán đúng, hiển thị tiến độ theo từng châu lục + tổng thể; cờ chưa sưu tập hiện mờ.

### Đã đổi
- Mục "Thử thách" đổi tên thành **"Trò chơi"**; quiz đoán cờ chuyển sang `/thu-thach/doan-co`.

## [1.4.1] - 2026-06-20

### Đã sửa
- Bản đồ: các quốc gia vắt qua kinh tuyến 180° (Nga, Fiji...) bị vẽ thành vệt ngang dài. Chuyển sang dùng `d3-geo` (tự cắt ở kinh tuyến 180°) nên các nước này hiển thị đúng.
- Loại bỏ Nam Cực khỏi bản đồ (không phải châu lục để học, gây vệt ở mép dưới).
- Đã kiểm tra vị trí toàn bộ 176 quốc gia trên bản đồ bằng trình duyệt: không nước nào lệch vị trí, không còn vệt ngang, không lỗi console.

## [1.4.0] - 2026-06-20

### Đã thêm
- Màn hình **Bản đồ thế giới** 🗺️ (route `/ban-do`): bản đồ tô màu theo châu lục, có nhãn từng châu (Châu Á, Châu Âu...) giúp bé hình dung vị trí và phạm vi sẽ học.
- Chạm vào một quốc gia trên bản đồ để xem tên + châu lục và mở trang chi tiết.
- Bản đồ dựng từ dữ liệu world-atlas (TopoJSON) bundle sẵn; tô màu theo mã số ISO (ccn3) khớp với dữ liệu quốc gia.

### Đã sửa
- Phần Thử thách chỉ còn chọn các nước có tên tiếng Việt thật (190 nước); loại bỏ lãnh thổ phụ thuộc và "Châu Nam Cực" khỏi danh sách khu vực.

## [1.3.0] - 2026-06-20

### Đã thêm
- Phần **Thử thách** cho phép chọn **châu lục** trước khi chơi (hoặc "Cả thế giới"), giúp bé mới học luyện theo từng khu vực cho dễ nhớ.
- Câu hỏi và đáp án nhiễu đều nằm trong châu lục đang chơi; có nút "Đổi khu vực" và hiển thị tên khu vực trong lúc chơi.

## [1.2.2] - 2026-06-20

### Đã sửa
- Khắc phục nhiều ảnh không hiển thị ở mục Du lịch / Ẩm thực / Văn hóa (vd nước Anh: Big Ben, Stonehenge, London Eye, Fish and Chips...).
- `wikiImage.js` tìm ảnh theo nhiều tầng hơn: bỏ tiền tố mô tả mở rộng (Thủ đô, Thác nước, Món, Bánh, Súp...) và **fallback tìm trên Wikipedia tiếng Anh** khi tiếng Việt không có.
- Thay 24 từ khóa quá hiếm (không có ảnh) bằng từ tương đương nổi tiếng, chính xác cho từng nước.
- Đã rà soát toàn bộ 1341 từ khóa ảnh của 190 nước; độ phủ ảnh đạt ~100%.

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

[1.5.0]: https://github.com/cuongtv2004/national/releases/tag/v1.5.0
[1.4.1]: https://github.com/cuongtv2004/national/releases/tag/v1.4.1
[1.4.0]: https://github.com/cuongtv2004/national/releases/tag/v1.4.0
[1.3.0]: https://github.com/cuongtv2004/national/releases/tag/v1.3.0
[1.2.2]: https://github.com/cuongtv2004/national/releases/tag/v1.2.2
[1.2.1]: https://github.com/cuongtv2004/national/releases/tag/v1.2.1
[1.2.0]: https://github.com/cuongtv2004/national/releases/tag/v1.2.0
[1.1.0]: https://github.com/cuongtv2004/national/releases/tag/v1.1.0
[1.0.0]: https://github.com/cuongtv2004/national/releases/tag/v1.0.0
