---
description: Hướng dẫn cập nhật Web Admin lên Firebase Hosting
---

# Quy trình Cập nhật Web Admin (Firebase Hosting)

Sử dụng workflow này khi bạn đã chỉnh sửa code (React/TypeScript) và muốn đẩy phiên bản mới lên trang web thực tế.

## Các bước thực hiện:

1.  **Chỉnh sửa Code:**
    Thực hiện các thay đổi mong muốn trên mã nguồn (ví dụ: sửa lỗi, thêm tính năng Activity Log...).

2.  **Kiểm tra thử (Local):**
    Chạy `npm run dev` để đảm bảo mọi thứ hoạt động tốt trên máy tính của bạn trước.

3.  **Build Production:**
    Tạo bản build tối ưu cho môi trường thực tế. Lệnh này sẽ tạo thư mục `dist`.
    ```bash
    // turbo
    npm run build
    ```

4.  **Deploy lên Firebase:**
    Đẩy thư mục `dist` lên Firebase Hosting.
    ```bash
    // turbo
    firebase deploy --only hosting
    ```

## Lưu ý:
-   Nếu chưa đăng nhập Firebase, chạy `firebase login` trước.
-   Nếu muốn xem trước (Preview) mà không ảnh hưởng trang chính, chạy `firebase hosting:channel:deploy preview_name`.
