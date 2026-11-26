<div align="center">

# 🔥 GRILLI — Bếp Than Hoa & Rượu Vang

**Website Tĩnh Nhà Hàng Cao Cấp · Đồ án Cuối Kì SE347 (Công nghệ Web & Ứng dụng) & Seminar GSAP**

[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.187-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-E4C590?style=for-the-badge)](https://lenis.darkroom.engineering/)

*Website tĩnh 100% tiếng Việt, tái hiện trọn vẹn trải nghiệm ẩm thực nướng than hoa & rượu vang tại TP. Thủ Đức — tích hợp trọn bộ hệ sinh thái chuyển động **GSAP** (`Timeline`, `ScrollTrigger`, `SplitText`, `Flip`, `quickTo`, `matchMedia`) cùng bàn thử vang **Three.js 3D** dựng hoàn toàn bằng code.*

</div>

---

## ✨ Điểm nổi bật

- **100% Website Tĩnh (Zero-Backend) nhưng đủ nghiệp vụ thực tế:**
  - Lọc thực đơn 20 món theo nhóm & chế độ ăn (*Chay, Cay, Không gluten*) kèm hộp chi tiết nguyên liệu, cảnh báo dị ứng và gợi ý rượu vang.
  - **Đặt bàn thông minh không cần máy chủ:** Tự động kiểm tra khung giờ còn trống theo ngày & giờ thực tế, tự động chuyển sang ngày mai khi bếp đã qua giờ nhận khách, giữ chỗ món ăn trước (*Pre-order*) với phiếu tóm tắt tự cộng tạm tính, lưu đặt bàn bằng `localStorage` (trừ chỗ trống thật) và xuất file lịch hẹn **`.ics`** lưu thẳng vào Google Calendar / Apple Calendar.
- **Trình diễn toàn diện GSAP 3.15 + Lenis:**
  - Đồng bộ nhịp cuộn mượt **Lenis** vào chung `gsap.ticker`, triệt tiêu hiện tượng giật khấc khi lăn chuột trên Windows.
  - Tích hợp sẵn **GSAP Inspector HUD (`Alt + G`)** hiển thị trực tiếp tiến độ cuộn, vận tốc lăn chuột, phân đoạn đang hoạt động và các plugin GSAP đang chạy — cực tiện khi thuyết trình Seminar.
- **Điểm nhấn 3D bằng Three.js (Lazy-loaded):**
  - Bàn thử rượu vang 3D với **3 dáng chai & chất liệu PBR riêng biệt** (*Bordeaux Đỏ, Provence Hồng, Alsace Trắng*), nhãn chai độ phân giải `2048×1536`, hiệu ứng mặt chất lỏng giữ thăng bằng theo trọng lực khi nghiêng rót và hỗ trợ kéo xoay tự do `360°`.
- **Tối ưu hiệu năng & Trải nghiệm di động:**
  - Toàn bộ **52 ảnh thật** nén `.webp` tự lưu nội bộ (`public/images/`), phông chữ tiếng Việt tự host (`Cormorant Garamond`, `Be Vietnam Pro`) không lo lỗi dấu hay phụ thuộc CDN ngoài.
  - Tự động điều chỉnh hiệu ứng theo màn hình với `gsap.matchMedia` và tôn trọng chế độ `prefers-reduced-motion`.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Lớp công nghệ | Thư viện / Công cụ | Vai trò trong dự án |
| :--- | :--- | :--- |
| **Khung giao diện** | `React 19`, `TypeScript`, `Vite 8` | Chia cấu trúc component rõ ràng, kiểm tra kiểu dữ liệu an toàn, đóng gói file tĩnh siêu nhẹ và tách chunk 3D riêng biệt |
| **Chuyển động** | `GSAP 3.15`, `@gsap/react`, `Lenis` | Điều phối toàn bộ animation (`Timeline`, `ScrollTrigger`, `SplitText`, `Flip`, `quickTo`, `matchMedia`) kết hợp cuộn mượt |
| **Đồ họa 3D** | `Three.js 0.187` | Dựng cảnh bàn rót rượu vang 3D hoàn toàn bằng mã nguồn (procedural geometry + PBR material + studio lighting) |
| **Thiết kế & Phông chữ** | CSS Variables (`tokens.css`), `@fontsource` | Bảng màu than gỗ ấm & vàng champagne thống nhất; phông tiếng Việt `Cormorant Garamond` & `Be Vietnam Pro` tự host |
| **Nghiệp vụ Web Tĩnh** | `localStorage`, `.ics` Generator, Web3Forms | Quản lý quỹ bàn trống theo khung giờ cao điểm, xuất file lịch hẹn `.ics` và tùy chọn gửi email đặt bàn qua Web3Forms |

---

## 🧭 Bản đồ 10 Phân đoạn & Ứng dụng GSAP

| # | Phân đoạn | Thành phần chính | Kỹ thuật GSAP & Tương tác nổi bật |
| :-: | :--- | :--- | :--- |
| **01** | **Trang chủ (`Hero` & `Pillars`)** | `Hero.tsx`, `Pillars.tsx` | `Timeline` chữ trồi theo lớp, thanh đếm ngược tự `pause` khi rê chuột, 3 cột ảnh trôi ngược chiều tạo chiều sâu 3D (`quickTo`) |
| **02** | **Câu chuyện (`Story`)** | `Story.tsx` | `SplitText` mở dòng theo mặt nạ, câu trích dẫn sáng dần theo nhịp cuộn (`scrub`), 3 lớp ảnh parallax, 4 chỉ số tự đếm tăng dần |
| **03** | **Món đặc trưng (`Signature`)** | `Signature.tsx` | `ScrollTrigger` ghim sân khấu (`pin + scrub`), đĩa món ăn mở xoay đồng tâm với vòng cung tiến độ SVG |
| **04** | **Thực đơn 20 món (`Menu`)** | `Menu.tsx`, `MenuDetail.tsx` | `ScrollTrigger.batch` hiện theo cặp kèm đường nối giá vẽ ngang, lọc món mượt không nhảy bố cục với **`Flip`**, xem chi tiết món & nút giữ món |
| **05** | **Dải chữ & Bếp trưởng (`Chef`)** | `Marquee.tsx`, `Chef.tsx` | Dải chữ đổi tốc độ & đảo chiều theo vận tốc cuộn (`getVelocity`), rèm lửa hé mở chân dung, thanh ray dọc thắp sáng 3 nguyên tắc `01 – 02 – 03` |
| **06** | **Thư viện 16 ảnh (`Gallery`)** | `Gallery.tsx`, `Lightbox.tsx` | Ghim màn hình cuộn ngang (`pin` + `containerAnimation`), khung ảnh nghiêng theo đà cuộn, lọc chủ đề & xem phóng to `Lightbox` |
| **07** | **Trải nghiệm 3D (`Experience`)** | `Experience.tsx`, `PourScene.ts` | GSAP `Timeline` điều khiển biến số rót rượu cho **Three.js** (đổi 3 dòng vang + kéo xoay `360°`) & 4 thẻ gói trải nghiệm nghiêng 3D |
| **08** | **Cảm nhận (`Testimonials`)** | `Testimonials.tsx` | Thẻ đánh giá thực khách xuất hiện nhịp nhàng theo cuộn |
| **09** | **Đặt bàn (`Reservation`)** | `Reservation.tsx`, `availability.ts` | Chọn ngày/khung giờ còn trống, giữ trước món ăn, phiếu tóm tắt bám cuộn, rung nhắc lỗi (`elastic`), tự vẽ dấu tích SVG & tải lịch `.ics` |
| **10** | **Liên hệ & Chân trang (`Contact`)** | `Contact.tsx`, `Footer.tsx` | Đèn báo trạng thái **Đang mở cửa / Đã hết ca** theo giờ thực tế, bản đồ tối đồng bộ bảng màu & thông tin lễ tân |

---

## ⌨️ Phím tắt & Mẹo Demo Seminar

| Phím tắt / Thao tác | Tác dụng |
| :--- | :--- |
| **`Alt + G`** | Bật / tắt bảng **GSAP Inspector HUD** ở góc dưới trái (hiển thị phân đoạn hiện tại, tiến độ cuộn, vận tốc chuột & danh sách plugin đang hoạt động) |
| **`F11`** | Xem toàn màn hình khi thuyết trình trực tiếp trên trình duyệt |
| **Kéo chuột trên bàn vang 3D** | Xoay tự do góc nhìn bàn tiệc rượu vang `360°` |
| **`←` / `→` / `Esc`** | Chuyển ảnh hoặc đóng hộp thoại trong Thư viện ảnh (`Lightbox`) và Chi tiết món (`MenuDetail`) |

---

## 📂 Cấu trúc thư mục

```text
grilli-gsap/
├── docs/                          # Tài liệu đồ án & kịch bản thuyết trình Seminar GSAP
│   ├── WORKFLOW.md                # Luồng xây dựng & phân tích kỹ thuật chi tiết
│   ├── 01-TONG-QUAN-WEBSITE-VA-GSAP.md
│   ├── 02-KICH-BAN-TRINH-BAY-22-PHUT.md
│   └── 03-FLOW-LY-THUYET-GSAP-VA-DO-AN-DE-HIEU.md
├── public/
│   └── images/                    # 52 ảnh chụp thực tế nén .webp (tự host nội bộ)
├── scripts/
│   ├── optimize-images.mjs        # Script nén & chuyển ảnh gốc sang .webp bằng Sharp
│   └── fetch-polyhaven.mjs        # Script tải tài nguyên môi trường ánh sáng
├── src/
│   ├── components/
│   │   ├── layout/                # Preloader, Topbar, Header, ScrollProgress, Footer, BackToTop, GsapInspector
│   │   ├── sections/              # 10 phân đoạn chính: Hero, Pillars, Story, Signature, Menu, Chef, Gallery, Experience, Testimonials, Reservation, Contact
│   │   ├── three/                 # PourScene.ts & pourState.ts (bàn thử rượu vang 3D)
│   │   ├── ui/                    # Button, Icons, Lightbox, MenuDetail, SectionHead
│   │   └── Marquee.tsx            # Dải chữ chạy phản ứng theo vận tốc cuộn
│   ├── data/                      # Dữ liệu 100% tiếng Việt: site.ts, content.ts, menu.ts
│   ├── lib/                       # gsap.ts, scroll.ts (Lenis), availability.ts, events.ts
│   ├── styles/                    # tokens.css, base.css, layout.css, ui.css, sections.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### Yêu cầu môi trường
- **Node.js** `>= 18` và **npm** `>= 9`

### Các bước chạy cục bộ (Local)

```bash
# 1. Tải mã nguồn về máy
git clone https://github.com/nguyenlam0909575475-tech/SE347-WebsiteNhaHang.git
cd SE347-WebsiteNhaHang

# 2. Cài đặt thư viện
npm install

# 3. Chạy môi trường phát triển (mặc định http://localhost:5173)
npm run dev
```

### Đóng gói Website Tĩnh (Production Build)

```bash
# Kiểm tra TypeScript và xuất bộ file tĩnh tối ưu vào thư mục dist/
npm run build

# Xem thử bản production ngay trên máy
npm run preview
```

### Tùy chọn: Gửi email đặt bàn thật qua Web3Forms
Tạo file `.env` ở thư mục gốc dự án:

```env
VITE_WEB3FORMS_KEY=your-web3forms-access-key
```

> Nếu không cấu hình `.env`, form Đặt bàn vẫn hoạt động đầy đủ ở chế độ **Web Tĩnh** (kiểm tra chỗ trống, trừ quỹ bàn trong `localStorage`, sinh mã đặt bàn `GRL-XXXXXX` và cho phép tải file lịch `.ics`).

---

## 📚 Tài liệu đi kèm

- 📄 [Phân tích kiến trúc & quy trình xây dựng (`docs/WORKFLOW.md`)](docs/WORKFLOW.md)
- 📄 [Tổng quan Website & Ứng dụng GSAP (`docs/01-TONG-QUAN-WEBSITE-VA-GSAP.md`)](docs/01-TONG-QUAN-WEBSITE-VA-GSAP.md)
- 📄 [Kịch bản thuyết trình 22 phút (`docs/02-KICH-BAN-TRINH-BAY-22-PHUT.md`)](docs/02-KICH-BAN-TRINH-BAY-22-PHUT.md)
- 📄 [Flow lý thuyết GSAP & Đồ án dễ hiểu (`docs/03-FLOW-LY-THUYET-GSAP-VA-DO-AN-DE-HIEU.md`)](docs/03-FLOW-LY-THUYET-GSAP-VA-DO-AN-DE-HIEU.md)

---

<div align="center">
  <sub>Đồ án môn học <strong>SE347 — Công nghệ Web và Ứng dụng</strong> · Đại học Công nghệ Thông tin (UIT)</sub>
</div>
