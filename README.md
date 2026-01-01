# Admin Pro HVAC - Hệ Thống Tra Cứu Lỗi & Quản Lý Sửa Chữa Điện Lạnh

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Banner" width="100%" />
</div>

## 📖 Giới Thiệu (Overview)

**Admin Pro HVAC** là một hệ sinh thái toàn diện hỗ trợ kỹ thuật viên điện lạnh (HVAC technicians) trong việc tra cứu, chẩn đoán và sửa chữa các lỗi trên thiết bị (Điều hòa, Máy giặt, Tủ lạnh...). Hệ thống bao gồm:

1.  **Mobile App (Flutter):** Ứng dụng dành cho thợ kỹ thuật, giúp tra cứu mã lỗi, xem hướng dẫn sửa chữa chi tiết, và lưu trữ lịch sử cá nhân.
2.  **Web Admin (React):** Trang quản trị dành cho quản lý, cập nhật dữ liệu mã lỗi và nội dung hướng dẫn theo thời gian thực.

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 📱 Mobile App (Dành cho Kỹ thuật viên)
-   **Tra cứu Mã Lỗi Nhanh:** Tìm kiếm lỗi theo Hãng, Model, hoặc Mã lỗi cụ thể.
-   **Quy trình Sửa chữa (Troubleshoot Flow):** Hướng dẫn từng bước (Step-by-step) để khắc phục sự cố.
-   **Nội dung Đa phương tiện:** Tích hợp hình ảnh sơ đồ và Video hướng dẫn sửa chữa trực quan.
-   **Yêu thích & Lịch sử:** Lưu lại các lỗi quan trọng và tự động ghi nhớ lịch sử tra cứu.
-   **Hoạt động Offline:** Hỗ trợ xem lại các nội dung đã lưu ngay cả khi không có mạng (Save Local).

### 💻 Web Admin (Dành cho Quản trị viên)
-   **Quản lý Mã Lỗi:** Thêm, sửa, xóa mã lỗi và cập nhật thông tin chi tiết.
-   **Soạn thảo Hướng dẫn:** Công cụ soạn thảo mạnh mẽ để thêm các bước kiểm tra, công cụ cần thiết (Tools) và linh kiện thay thế (Components).
-   **Dashboard Thống kê:** Theo dõi các lỗi thường gặp và xu hướng tìm kiếm (Future).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Mobile Application
-   **Framework:** [Flutter](https://flutter.dev/) (Dart)
-   **State Management:** [Riverpod](https://riverpod.dev/)
-   **Navigation:** [GoRouter](https://pub.dev/packages/go_router)
-   **Local Storage:** SharedPreferences

### Web Dashboard
-   **Frontend:** [React](https://reactjs.org/) + TypeScript
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

### Backend & Infrastructure
-   **Database:** Google Firebase Firestore
-   **Authentication:** Firebase Auth
-   **Hosting:** Firebase Hosting / Vercel

---

## 🚀 Cài Đặt & Chạy Dự Án (Getting Started)

### Yêu cầu (Prerequisites)
-   Node.js (v18+)
-   Flutter SDK (v3.10+)
-   Tài khoản Firebase & cấu hình `google-services.json` (Android) / `GoogleService-Info.plist` (iOS)

### 1. Chạy Web Admin
```bash
# Di chuyển vào thư mục gốc
cd Admin-Pro-HVAC

# Cài đặt dependencies
npm install

# Chạy server development
npm run dev
```

### 2. Chạy Mobile App
```bash
# Di chuyển vào thư mục mobile
cd mobile

# Cài đặt packages
flutter pub get

# Chạy ứng dụng (chọn thiết bị giả lập hoặc máy thật)
flutter run
```

---

## 📂 Cá Trúc Dự Án (Project Structure)

```
Admin-Pro-HVAC/
├── components/         # React Components (Web)
├── mobile/            # Flutter Project
│   ├── lib/
│   │   ├── core/      # Constants, Themes, Utils
│   │   ├── features/  # Feature-based Architecture (Auth, Home, Saved, History...)
│   │   └── main.dart
├── src/               # React Source Logic
├── App.tsx            # Web Main Entry
└── README.md
```

---

## 🤝 Đóng Góp (Contributing)
Mọi đóng góp đều được hoan nghênh. Vui lòng tạo Pull Request hoặc mở Issue để thảo luận về các thay đổi lớn.

## 📄 License
Dự án được phát hành dưới giấy phép [MIT](LICENSE).
