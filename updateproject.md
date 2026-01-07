TỔNG HỢP CHIẾN LƯỢC PHÁT TRIỂN ADMIN PRO  
Product Master Specification Document

Phiên bản: 1.0  
Ngày: 01/01/2026  
Tác giả: Admin Pro Development Team

\=====================================

MỤC LỤC

1\. TẦM NHÌN & BỐI CẢNH SẢN PHẨM  
2\. KIẾN TRÚC MODULE CẤP CAO  
3\. ĐẶC TẢ CHI TIẾT THEO MODULE  
4\. LỘ TRÌNH TRIỂN KHAI (ROADMAP)  
5\. PHỤ LỤC KỸ THUẬT

\=====================================

1\. TẦM NHÌN & BỐI CẢNH SẢN PHẨM

1.1. Giới thiệu Hệ thống

Admin Pro là một hệ thống quản trị thông minh (Intelligent Command Center) dành cho ngành dịch vụ điều hòa & HVAC, kết nối chặt chẽ với mô hình Servitization \- chuyển từ sản phẩm sang trải nghiệm dịch vụ.

Phạm vi Hệ thống:  
• Web Admin Console (React \+ Vite \+ TypeScript \+ Firebase)  
• Ứng dụng Kỹ thuật viên (Flutter Mobile App)  
• Portal Khách hàng (Tương lai)

1.2. Tầm nhìn chiến lược

Chuyển đổi Admin Pro từ một "Admin Panel" truyền thống thành một Business OS tích hợp AI, bao gồm:

• Quản trị bảo hành thông minh (WMS \- Warranty Management System)  
• Quản trị dịch vụ hiện trường (FSM \- Field Service Management)  
• Trung tâm kiến thức kỹ thuật (Knowledge Base & Video CMS)  
• Hệ thống AI Ops để nhập liệu tự động và giám sát quota

1.3. Mục tiêu kinh doanh

• Giảm thời gian nhập liệu thủ công 70% thông qua AI Smart Import  
• Tăng hiệu suất kỹ thuật viên 40% nhờ tra cứu mã lỗi nhanh qua Mobile  
• Chuyển đổi 20% người dùng miễn phí lên gói Premium trong 6 tháng  
• Tự động hóa 60% quy trình phê duyệt bảo hành qua Rules Engine

1.4. Người dùng chính

• Admin / Owner: Quản trị toàn bộ hệ thống, cấu hình, bảo mật, thanh toán  
• Supervisor / Manager: Giám sát kỹ thuật viên, duyệt phiếu bảo hành, xem báo cáo  
• Technician: Sử dụng Mobile app tra cứu mã lỗi, ghi nhận công việc  
• Customer: (Tương lai) Đăng ký dịch vụ, theo dõi tiến độ sửa chữa

\=====================================

2\. KIẾN TRÚC MODULE CẤP CAO

Dưới đây là toàn bộ các module cốt lõi của hệ thống (không bỏ sót):

2.1. NỀn tảng & Hạ tầng (Foundation)

✓ Settings (Cài đặt): SMTP, EmailJS, Gemini API, AI Model Config  
✓ Security: RBAC (Role-Based Access Control), Audit Log, Session Management, 2FA  
✓ Backup & Restore: Sao lưu Firestore, tiến độ trực quan, xác nhận nhiều bước  
✓ System Health: Giám sát Firebase quota, uptime, cảnh báo

2.2. Kinh doanh & Tài chính (Business Operations)

✓ Service Plans: Quản lý gói dịch vụ (Free, Pro, Enterprise), pricing matrix  
✓ Payment Gateways: VietQR, Stripe, PayPal, lịch sử giao dịch  
✓ Users & Roles: Quản lý người dùng, phân quyền chi tiết  
✓ Transactions: Lịch sử thanh toán, xuất CSV, bộ lọc

2.5. Kiến thức & Nội dung (Knowledge & Content)

✓ Document Library: Thư viện tài liệu kỹ thuật  
○ Video CMS: Quản lý video hướng dẫn, performance analytics (Chưa triển khai)  
○ Knowledge Base: Hệ thống tìm kiếm kiến thức thông minh (Chưa triển khai)  
○ Search Analytics: Phân tích từ khóa tìm kiếm phổ biến (Chưa triển khai)

2.6. AI Operations (AI Ops)

✓ AI Rate Limits Dashboard: Giám sát quota Gemini API, cost estimate, màu cảnh báo  
✓ Smart Import (OCR \+ Validation): Nhập liệu tự động từ PDF/Ảnh, click-to-fill, bounding boxes  
○ Content Performance: Đánh giá chất lượng nội dung AI (Chưa triển khai)

\=====================================

3\. ĐẶC TẢ CHI TIẾT THEO MODULE

Phần này trình bày đầy đủ tất cả các module cốt lõi, kết hợp từ 3 báo cáo phân tích và thực tế codebase.

3.1. MODULE CÀI ĐẶT (SETTINGS)

Mục tiêu: Trung tâm cấu hình cho toàn bộ hệ thống

Người dùng: Admin, Owner

Giao diện chính:  
• Layout: Tab-based navigation (SMTP, EmailJS, AI Config, System)  
• Component: Form inputs, Test Send button, API key masking  
• Progressive Disclosure: Ẩn các thiết lập nâng cao trong accordion

Luồng nghiệp vụ:  
1\. Admin vào Settings \> SMTP Config  
2\. Nhập SMTP credentials (host, port, username, password)  
3\. Click "Test Send" để gửi email thử  
4\. Nếu thành công, hiển thị "Email sent successfully"  
5\. Click "Lưu cấu hình" để lưu vào Firestore

Trường dữ liệu chính (Firestore collection: systemSettings):  
• smtpHost: string  
• smtpPort: number  
• smtpUser: string (encrypted)  
• smtpPassword: string (encrypted)  
• emailjsServiceId: string  
• geminiApiKey: string (masked UI)  
• aiModel: string (gemini-2.5-flash | gemini-2.5-pro | gemini-2.0-flash-thinking-exp)

Chỉ số KPI:  
• Email delivery rate: 99%+  
• API key rotation frequency: Mỗi 90 ngày

Cải tiến ưu tiên (từ báo cáo UI/UX):  
✓ Thêm Test Send button cho SMTP  
✓ API key masking (hiển thị \*\*\*\*\*\*\*\*abc123)  
✓ Smart validation (kiểm tra port range, email format)  
○ Context-aware help text (tooltip giải thích mỗi field)

\---

3.2. MODULE BẢO MẬT (SECURITY)

Mục tiêu: Bảo vệ dữ liệu và kiểm soát truy cập

Người dùng: Admin, Security Officer

Giao diện chính:  
• Audit Log Table: Timestamp, User, Action, IP Address, Status  
• Session Management: Active sessions list, Force logout button  
• RBAC Matrix: Role vs Permission grid

Luồng nghiệp vụ (Audit Log):  
1\. Admin vào Security \> Audit Log  
2\. Xem danh sách hoạt động gần đây (realtime)  
3\. Lọc theo User, Action type, Date range  
4\. Xuất CSV để báo cáo tuân thủ (compliance)

Trường dữ liệu (Firestore collection: auditLogs):  
• timestamp: Timestamp  
• userId: string (ref)  
• action: string (CREATE, UPDATE, DELETE, LOGIN)  
• resource: string (errorCodes, users, settings)  
• ipAddress: string  
• success: boolean  
• metadata: object (chi tiết thay đổi)

Quy tắc bảo mật:  
• Mọi thao tác quan trọng đều ghi log  
• Nhậy cảm data phải encrypted at rest  
• Session timeout: 30 phút không hoạt động  
• 2FA: Bắt buộc cho Admin role

Cải tiến ưu tiên:  
✓ Real-time audit log hiển thị  
○ 2FA setup flow (QR code \+ backup codes)  
○ IP whitelist cho Admin accounts  
○ Anomaly detection (cảnh báo nếu login từ IP lạ)

\---

3.3. MODULE SAO LƯU & PHỤC HỔI (BACKUP & RESTORE)

Mục tiêu: Đảm bảo tính liên tục dữ liệu

Người dùng: Admin

Giao diện chính:  
• Backup List: Tên, Kích thước, Ngày tạo, Trạng thái  
• Progress Bar: Hiển thị tiến độ sao lưu/phục hồi realtime  
• Confirmation Dialog: Xác nhận nhiều bước cho phục hồi

Luồng nghiệp vụ (Tạo Backup):  
1\. Admin vào Backup \> Tạo backup mới  
2\. Chọn collections: errorCodes, users, transactions  
3\. Click "Bắt đầu sao lưu"  
4\. Progress bar hiển thị: "20% \- Sao lưu errorCodes..."  
5\. Hoàn tất: Download file JSON hoặc lưu Firebase Storage

Trường dữ liệu (Firestore collection: backups):  
• name: string (auto-generated: backup\_2026-01-01\_10-30)  
• size: number (bytes)  
• collections: string\[\] (danh sách collections đã sao lưu)  
• createdAt: Timestamp  
• createdBy: userId  
• status: string (completed, failed, in\_progress)  
• downloadUrl: string (Firebase Storage URL)

Quy tắc:  
• Tự động sao lưu hàng ngày lúc 2AM  
• Giữ backup 30 ngày gần nhất  
• Phục hồi phải xác nhận 2 lần (nguy hiểm ghi đè dữ liệu)

Cải tiến ưu tiên (từ báo cáo):  
✓ Progress bar với percentage và mô tả  
✓ Xác nhận nhiều bước cho Restore  
○ Incremental backup (đề giảm dung lượng)  
○ Point-in-time recovery (chọn thời điểm cụ thể)

\---

3.4. MODULE QUẢN LÝ MÃ LỖI (ERROR CODE CMS)

Mục tiêu: Trung tâm kiến thức kỹ thuật, trái tim của hệ thống

Người dùng: Admin (biên tập), Technician (xem)

Giao diện chính:  
• Danh sách: Bảng data với cột Mã lỗi, Hãng, Tiêu đề, Cập nhật  
• Biên tập: Tab-based form (Thông tin chung, Chẩn đoán, Quy trình sửa, Linh kiện, Video)  
• Component: Sticky header, Drag & Drop steps, Tag input

Luồng nghiệp vụ (Tạo/Sửa mã lỗi):  
1\. Admin vào Quản lý Lỗi \> Thêm mới  
2\. Tab "Thông tin chung": Nhập Mã (E1), Hãng (Panasonic), Model (CU-XPU9XKH-8), Tiêu đề, Mức độ (Cao/Trung bình/Thấp)  
3\. Tab "Chẩn đoán": Mô tả triệu chứng và nguyên nhân  
4\. Tab "Quy trình": Nhập các bước sửa chữa (kéo thả để sắp xếp)  
5\. Tab "Linh kiện": Thêm tags linh kiện và công cụ cần thiết  
6\. Tab "Video": Dán YouTube URLs  
7\. Click "Lưu tất cả thay đổi" (nút sticky ở trên cùng)

Trường dữ liệu (Firestore collection: errorCodes):  
• code: string (E1, E2, F1...)  
• brand: string (Panasonic, Daikin, Mitsubishi...)  
• model: string  
• title: string  
• symptom: string (Triệu chứng)  
• cause: string (Nguyên nhân)  
• steps: string\[\] (Các bước sửa chữa theo thứ tự)  
• components: string\[\] (Linh kiện liên quan)  
• tools: string\[\] (Công cụ cần thiết)  
• videos: string\[\] (YouTube URLs)  
• status: string (active | pending | draft)  
• severity: string (high | medium | low)  
• isCommon: boolean (Hiển thị trang chủ mobile)  
• searchCount: number (Số lần tìm kiếm \- analytics)  
• createdAt: Timestamp  
• updatedAt: Timestamp

Chỉ số KPI:  
• Tổng số mã lỗi: 150+ (mục tiêu)  
• Lỗi phổ biến nhất (isCommon): 20 mã  
• Coverage: % mã lỗi có video hướng dẫn

Cải tiến ưu tiên (từ báo cáo UI/UX v3.0):  
✓ Sticky Header khi cuộn (nút Lưu luôn hiển thị)  
○ Drag & Drop reordering cho steps  
○ Autosave (debounce 3s)  
○ Autocomplete cho brand/model (tránh trùng lặp)  
○ Sparklines: Hiển thị xu hướng tìm kiếm 30 ngày bên cạnh mỗi mã lỗi  
○ Quick Preview Drawer: Click dòng để xem nhanh thay vì chuyển trang  
○ Rich Media Support: Paste ảnh trực tiếp vào mỗi bước

\---

3.5. MODULE AI SMART IMPORT (OCR & VALIDATION)

Mục tiêu: Tự động hóa nhập liệu từ tài liệu kỹ thuật

Người dùng: Admin

Giao diện chính:  
• Upload Zone: Kéo thả file PDF/Ảnh  
• Preview: Hiển thị ảnh với bounding boxes  
• Click-to-Fill Form: Nhấp field để điền tự động

Luồng nghiệp vụ:  
1\. Admin vào Nhập liệu AI \> Upload tài liệu  
2\. Kéo thả file PDF catalog của Panasonic (5MB)  
3\. Hệ thống gọi Gemini API để phân tích (hiển thị progress)  
4\. AI trích xuất: Mã lỗi E1, Title, Symptom, Cause, Steps...  
5\. Hiển thị form preview với dữ liệu điền sẵn  
6\. Admin kiểm tra và chỉnh sửa nếu cần  
7\. Click "Xác nhận và lưu vào CMS"

Công nghệ (AIService.ts):  
• analyzeFileContent(base64Data, mimeType, context)  
• Model: gemini-2.5-flash (có thể nâng cấp gemini-2.5-pro cho PDF phức tạp)  
• responseMimeType: "application/json"  
• maxOutputTokens: 8192  
• JSON Fixer: Xử lý JSON bị truncate (stack-based)

Trường dữ liệu trả về:  
{  
  "code": "E1",  
  "title": "Tên lỗi",  
  "symptom": "Hiện tượng",  
  "cause": "Nguyên nhân",  
  "components": \["Linh kiện 1", "Linh kiện 2"\],  
  "steps": \["Bước 1", "Bước 2"\],  
  "tools": \["Công cụ"\],  
  "hasImage": true/false  
}

Chỉ số KPI:  
• Accuracy: 85%+ (AI trích xuất đúng)  
• Tiết kiệm thời gian: 70% so với nhập thủ công  
• Gemini API quota: Giám sát qua AI Ops Dashboard

Cải tiến ưu tiên:  
✓ JSON recovery logic (xử lý truncate)  
○ Bounding boxes: Hiển thị vùng trích xuất trên ảnh  
○ Batch import: Upload nhiều file cùng lúc  
○ Confidence score: Hiển thị % chắc chắn của AI cho mỗi field

\---

3.6. MODULE AI OPS DASHBOARD

Mục tiêu: Giám sát hiệu suất và chi phí AI

Người dùng: Admin, Dev Ops

Giao diện chính:  
• Quota Progress Bar: Hiển thị % sử dụng (ví dụ: 45/100 requests)  
• Màu cảnh báo: Xanh (\<70%), Vàng (70-90%), Đỏ (\>90%)  
• Cost Estimate: Ước tính chi phí tháng ($12.5)

Trường giám sát:  
• requests\_used: number (45)  
• requests\_limit: number (100)  
• tokens\_input: number (tổng tokens input)  
• tokens\_output: number (tổng tokens output)  
• estimated\_cost: number (USD)  
• model\_used: string (gemini-2.5-flash)

Cải tiến ưu tiên:  
✓ Progress bar với màu cảnh báo  
✓ Cost estimate hiển thị  
○ Real-time quota tracking (WebSocket)  
○ Alert email khi vượt 85% quota  
○ Historical chart: Usage theo ngày/tuần/tháng

\---

3.7. MODULE DASHBOARD & BIỂU ĐỒ

Mục tiêu: Tổng quan kinh doanh một cái nhìn

Người dùng: Admin, Manager

Giao diện chính (từ screenshot localhost:3000):  
• Bento Grid: Các thẻ thống kê (Users, Revenue, Chờ duyệt...)  
• Line Chart: Doanh thu theo tháng (Recharts)  
• Conversion Funnel: Free → Premium

Chỉ số hiển thị:  
• Tổng người dùng: 2 (hiện tại)  
• Quản trị viên: 2  
• Doanh thu & tháng gần đây: Line chart (T7-T12)

Cải tiến ưu tiên (từ báo cáo):  
○ Dynamic Bento Grid: Ẩn thẻ có giá trị 0  
○ Trend Indicators: ▲ 12% so với tháng trước  
○ Real-time updates (Firebase onSnapshot)  
○ Export dashboard to PDF

\---

3.8. MODULE GÓI DỊCH VỤ (SERVICE PLANS)

Mục tiêu: Quản lý pricing và features cho Free/Pro/Enterprise

Giao diện:  
• Pricing Matrix: Bảng so sánh gói  
• Feature Toggles: Bật/tắt tính năng theo gói

Trường dữ liệu (collection: servicePlans):  
• name: string (Free, Pro, Enterprise)  
• price: number (0, 299000, 999000 VNĐ/tháng)  
• features: string\[\] (danh sách tính năng)  
• limits: object { maxUsers, maxErrorCodes, aiQuota }

Cải tiến:  
○ A/B testing cho giá  
○ Discount codes  
○ Annual billing (giảm 20%)

\---

3.9. MODULE THANH TOÁN (PAYMENT GATEWAYS)

Mục tiêu: Tích hợp VietQR, Stripe, PayPal

Luồng nghiệp vụ (VietQR):  
1\. User chọn gói Pro \> Click "Nâng cấp"  
2\. Chọn phương thức: VietQR  
3\. Hệ thống tạo QR code (số tài khoản, nội dung CK)  
4\. User quét mã và chuyển tiền  
5\. Webhook từ ngân hàng xác nhận  
6\. Hệ thống cập nhật plan của user thành Pro

Trường dữ liệu (collection: transactions):  
• userId: string  
• amount: number  
• currency: string (VND, USD)  
• method: string (vietqr, stripe, paypal)  
• status: string (pending, completed, failed)  
• transactionId: string (unique)  
• createdAt: Timestamp

Cải tiến:  
✓ VietQR integration  
○ Stripe Checkout hosted page  
○ PayPal subscription  
○ Invoice generation (PDF)  
○ Refund flow

\---

3.10. MODULE BẢO HÀNH NÂNG CAO (TƯƠNG LAI)

Các module chưa triển khai, ưu tiên trung bình:

○ Claims Engine: Tự động phê duyệt bảo hành theo Rules  
○ Fraud Detection: AI phát hiện gian lận  
○ Supplier Recovery: Thu hồi chi phí nhà cung cấp  
○ Recall & Campaign Management  
○ Field Dispatch Board  
○ Route Optimization  
○ Van Stock & Inventory  
○ Video CMS với analytics

(Chi tiết các module này trong báo cáo "Tính năng còn thiếu" \- doc 2\)

\=====================================

4\. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

Đây là lộ trình ưu tiên chi tiết, kết hợp MoSCoW và P0/P1/P2 từ 3 báo cáo.

4.1. QUÝ 1/2026 (Q1) \- NỀN TẢNG VỮNG CHẮC

Phân loại: P0 / Must-Have

Module Settings:  
✓ SMTP Config với Test Send button  
✓ API key masking (hiển \*\*\*\*\*\*\*\*abc123)  
✓ Smart validation (port, email format)

Module Security:  
✓ Audit Log realtime với filter  
✓ Session Management với force logout  
○ 2FA setup flow (QR code \+ backup codes)

Module Backup:  
✓ Progress bar với percentage  
✓ Xác nhận nhiều bước cho Restore  
○ Tự động backup hàng ngày 2AM

Module Error Code CMS:  
✓ Sticky Header khi cuộn  
○ Drag & Drop reordering steps  
○ Autosave (debounce 3s)

Module AI Ops:  
✓ Quota dashboard với màu cảnh báo  
✓ Cost estimate hiển thị  
○ Alert email khi quota \> 85%

Milestone: Admin Pro v3.2 \- "Foundation Release"

\---

4.2. QUÝ 2/2026 (Q2) \- VẬN HÀNH CỐT LÕI

Phân loại: P1 / Core Operations

Module Smart Import:  
○ Click-to-fill form  
○ Bounding boxes trên ảnh  
○ Batch import (nhiều file)  
○ Confidence score cho mỗi field

Module Service Plans:  
○ Pricing matrix đầy đủ  
○ Feature toggles theo gói  
○ Annual billing (giảm 20%)

Module Payment:  
○ VietQR full flow với webhook  
○ Stripe Checkout integration  
○ Invoice generation (PDF)

Module Dashboard:  
○ Dynamic Bento Grid (Ẩn thẻ \= 0\)  
○ Trend Indicators (▲ % so với tháng trước)  
○ Real-time updates với Firebase onSnapshot  
○ Export dashboard to PDF

Milestone: Admin Pro v3.3 \- "Business Ready"

\---

4.3. QUÝ 3-4/2026 (Q3-Q4) \- NÂNG CAO & AI/WMS

Phân loại: P2-P3 / Advanced & Full WMS

Module Claims Engine:  
○ Rules-based auto-approval  
○ Workflow designer (drag & drop)  
○ Multi-level approval

Module Fraud Detection:  
○ AI anomaly detection  
○ Pattern recognition (trùng lặp phiếu bảo hành)  
○ Risk scoring

Module Field Operations:  
○ Field Dispatch Board (kanban style)  
○ Route Optimization (Google Maps API)  
○ Van Stock & Inventory tracking

Module Video CMS:  
○ Video upload và transcoding  
○ Watch time analytics  
○ Video search với AI transcript

Module Recall & Campaign:  
○ Mass notification system  
○ Campaign tracking dashboard  
○ Customer response tracking

Milestone: Admin Pro v4.0 \- "Enterprise WMS"

\---

4.4. BẢNG TÓM TẮT ƯU TIÊN

| Module                | P0 (Q1) | P1 (Q2) | P2 (Q3-Q4) | Trạng thái Hiện tại |  
|-----------------------|---------|---------|------------|---------------------|  
| Settings              | ✓       |         |            | 70% hoàn tất        |  
| Security (Audit Log)  | ✓       |         |            | 60% hoàn tất        |  
| Backup & Restore      | ✓       |         |            | 50% hoàn tất        |  
| Error Code CMS        | ✓       |         |            | 80% hoàn tất        |  
| AI Smart Import       |         | ✓       |            | 70% hoàn tất        |  
| AI Ops Dashboard      | ✓       |         |            | 50% hoàn tất        |  
| Service Plans         |         | ✓       |            | 40% hoàn tất        |  
| Payment (VietQR)      |         | ✓       |            | 30% hoàn tất        |  
| Dashboard BI          |         | ✓       |            | 60% hoàn tất        |  
| Claims Engine         |         |         | ✓          | Chưa bắt đầu       |  
| Fraud Detection       |         |         | ✓          | Chưa bắt đầu       |  
| Field Dispatch        |         |         | ✓          | Chưa bắt đầu       |  
| Video CMS             |         |         | ✓          | Chưa bắt đầu       |  
| Recall Management     |         |         | ✓          | Chưa bắt đầu       |

\=====================================

5\. PHỤ LỤC KỸ THUẬT

5.1. TECH STACK HIỆN TẠI

Frontend (Web Admin Console):  
• Framework: React 19.2.3  
• Build Tool: Vite 6.2.0  
• Language: TypeScript 5.8.2  
• Styling: Tailwind CSS 4.1.18 \+ @tailwindcss/forms  
• Charts: Recharts 3.6.0  
• Date: date-fns 4.1.0  
• CSV: papaparse 5.5.3  
• Email: @emailjs/browser 4.4.1

Backend & Database:  
• Firebase 12.7.0 (Auth, Firestore, Storage, Functions)  
• Firestore Rules: Bảo mật collection-level

AI & ML:  
• @google/genai 1.34.0 (Gemini API)  
• Models hỗ trợ: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash-thinking-exp

Mobile (Technician App):  
• Framework: Flutter  
• Modules: Auth, Dashboard, Error Detail, History

\---

5.2. CẤU TRÚC FIRESTORE COLLECTIONS

Phân cấp chính:

systemSettings (singleton doc)  
  ├─ smtpHost, smtpPort, smtpUser, smtpPassword  
  ├─ emailjsServiceId, emailjsTemplateId  
  └─ geminiApiKey, aiModel

errorCodes (collection)  
  └─ {errorId} (doc)  
      ├─ code, brand, model, title  
      ├─ symptom, cause, steps\[\], components\[\], tools\[\], videos\[\]  
      ├─ status, severity, isCommon  
      └─ createdAt, updatedAt, searchCount

users (collection)  
  └─ {userId} (doc)  
      ├─ email, displayName, role  
      ├─ plan (free | pro | enterprise)  
      └─ createdAt, lastLogin

servicePlans (collection)  
  └─ {planId} (doc: free, pro, enterprise)  
      ├─ name, price, currency  
      ├─ features\[\]  
      └─ limits { maxUsers, maxErrorCodes, aiQuota }

transactions (collection)  
  └─ {txnId} (doc)  
      ├─ userId, amount, currency, method  
      ├─ status, transactionId  
      └─ createdAt

auditLogs (collection)  
  └─ {logId} (doc)  
      ├─ timestamp, userId, action, resource  
      ├─ ipAddress, success  
      └─ metadata {}

backups (collection)  
  └─ {backupId} (doc)  
      ├─ name, size, collections\[\], status  
      ├─ createdAt, createdBy  
      └─ downloadUrl

\---

5.3. CHUẨN UI/UX VÀ THIẾT KẾ

Nguyên tắc Progressive Disclosure:  
• Hiển thị 20% thông tin quan trọng nhất trước  
• Ẩn thông tin nâng cao trong accordion/drawer  
• Dùng tabs cho các form phức tạp (Settings, Error Edit)

Wayfinding (Định hướng):  
• Sidebar Navigation: Module chính  
• Breadcrumbs: Hiển thị vị trí hiện tại  
• Command Palette (Tương lai): Ctrl+K / Cmd+K để tìm kiếm toàn cục

Accessibility (WCAG 2.1 Level AA):  
• Contrast Ratio: 4.5:1 (text), 3:1 (large text)  
• Dark Mode: Xám đậm thay vì đen tuyền  
• Màu cảnh báo: Giảm độ bão hòa trong Dark Mode

Component Patterns:  
• Sticky Header: Nút hành động luôn hiển thị khi cuộn  
• Progress Bar: Hiển thị tiến độ cho backup, AI analysis  
• Toast Notification: Thông báo thành công/lỗi  
• Confirmation Dialog: Xác nhận hành động nguy hiểm (Restore, Delete)

\---

5.4. CHUẨN BẢO MẬT

RBAC (Role-Based Access Control):  
• Admin: Full access  
• Manager: Read \+ Write (không Delete)  
• Technician: Read-only (mobile app)

Audit Logging:  
• Ghi log mọi CREATE, UPDATE, DELETE  
• Bao gồm: userId, timestamp, action, resource, IP, metadata

Encryption:  
• At rest: Firebase Firestore mặc định encrypted  
• In transit: HTTPS cho mọi API call  
• Sensitive fields: SMTP password, API keys phải encrypted/masked

Session Management:  
• Timeout: 30 phút không hoạt động  
• Force logout: Admin có thể kick session khác  
• 2FA (Tương lai): Bắt buộc cho Admin role

\---

5.5. HƯỞNG DẪN DÙNG ANTIGRAVITY ĐỂ "AI DEV"

Tuân theo quy trình:

1\. Mở project trong Antigravity:  
   \- Open folder: admin-pro-hvac  
   \- Cho agent đọc repo structure (package.json, src/)

2\. Mô tả ngữ cảnh rõ ràng:  
   "You are refactoring a Vite \+ React \+ TS \+ Firebase admin console for HVAC service. Read the existing folder structure (components, services, types). Keep Tailwind design and Vietnamese labels. Do not introduce new state libraries."

3\. Chia nhỏ task:  
   \- Mỗi lần 1 tính năng (ví dụ: "Add autosave to ErrorEdit.tsx")  
   \- Không yêu cầu cả hệ thống trong 1 prompt

4\. Review code diff:  
   \- Đọc artifact plan trước khi accept  
   \- Comment trực tiếp vào file để agent refactor

Ví dụ prompt cụ thể:

"Open components/ErrorEdit.tsx and add autosave, step reordering (drag and drop), and basic validation (required fields). Reuse existing errorService. Keep UX and Tailwind classes, only touch logic and minimal markup."

"Open AIService.ts and related components (OCRTool/SmartErrorImport). Improve error handling and typing, and expose a helper that returns AnalyzedError type, to be used directly to prefill ErrorEdit form."

\---

5.6. TÀI LIỆU THAM KHẢO

Từ 3 báo cáo gốc:

1\. "Phân tích và Cải tiến Giao diện Admin Pro" (Doc 1\)  
   \- Nguyên lý thiết kế cốt lõi  
   \- Phân tích Settings, Backup, Security, Payment, Service Plans  
   \- Chuẩn UI/UX & Accessibility

2\. "Đề xuất Tính năng còn thiếu cho Service Console" (Doc 2\)  
   \- Servitization & WMS/FSM vision  
   \- Claims Engine, Fraud Detection, Supplier Recovery  
   \- Field Dispatch, Route Optimization, Van Stock  
   \- Video CMS, Recall Management

3\. "Báo cáo Chiến lược Toàn diện v3.0" (Doc 3\)  
   \- Phân tích Error Code CMS chi tiết  
   \- Dashboard & AI Ops  
   \- Sticky Header, Drag & Drop, Sparklines  
   \- Bento Grid, Trend Indicators

Nguồn tham khảo kỹ thuật:  
• React Documentation: react.dev  
• Firebase Docs: firebase.google.com/docs  
• Gemini API: ai.google.dev/gemini-api  
• Tailwind CSS: tailwindcss.com  
• WCAG 2.1: w3.org/WAI/WCAG21/quickref

\=====================================

KẾT THÚC TÀI LIỆU

Tài liệu này tổng hợp đầy đủ tầm nhìn, kiến trúc, đặc tả module, lộ trình và hướng dẫn kỹ thuật cho dự án Admin Pro. Không bỏ sót phần nào từ 3 báo cáo phân tích ban đầu.

Link tài liệu này: \[Tự động tạo bởi Google Docs\]

Phiên bản: 1.0  
Ngày: 01/01/2026  
Tác giả: Admin Pro Development Team  
