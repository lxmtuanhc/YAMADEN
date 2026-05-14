# HANDOFF CONTEXT

## 1. Tình trạng deploy hiện tại

- Render URL hiện tại: `https://yamaden.onrender.com`
- Backend đã chạy được trên Render sau các lần sửa deploy.
- MongoDB: logs trước đó đã qua giai đoạn lỗi Node module; cần kiểm tra Render logs mới nhất để xác nhận dòng `MongoDB connected` trong lần deploy hiện tại.
- Các lỗi deploy đã sửa:
  - Đã sửa lỗi CommonJS/ES Module: `server.js` dùng `require(...)` nhưng `package.json` có `"type": "module"`. Đã xóa `"type": "module"`.
  - Đã sửa lỗi frontend production load trực tiếp `/src/main.tsx`: `server.js` chuyển sang serve Vite build từ `dist`.
  - Đã sửa lỗi thiếu `dist/index.html`: `package.json` có `"build": "vite build"`, `"start": "node server.js"`, và `"postinstall": "npm run build"` để Render tạo `dist`.
  - Đã sửa/nghi ngờ lỗi legacy service worker/PWA cache:
    - `js/service-worker.js` hiện chỉ xóa cache legacy và tự unregister.
    - `src/components/LegacyServiceWorkerCleanup.tsx` unregister service worker cũ và xóa cache `yamaden-support*` khi React app chạy.
    - `server.js` serve `/js/service-worker.js` với `Cache-Control: no-store`.

## 2. Vấn đề đang xử lý hiện tại

- Layout JP/VN trên mobile/PWA vẫn bị nhảy khi đổi ngôn ngữ.
- Desktop web có thể ổn, nhưng PWA/mobile thật vẫn có hiện tượng card/button/section/nav thay đổi kích thước hoặc lệch vị trí.
- Nguyên nhân nghi ngờ:
  - Text tiếng Việt/Nhật dài ngắn khác nhau làm card/button/section giãn.
  - PWA/service worker cũ có thể cache bản cũ, làm CSS mới không áp dụng.
  - Các lớp CSS global trước đó chưa đủ hoặc chưa đánh đúng class thật.
  - Một số component có thể vẫn đang dùng layout auto-height theo text.

## 3. Hướng xử lý đã thống nhất

- Ưu tiên sửa layout JP/VN mobile/PWA trước, chưa nâng cấp chức năng khác.
- Không rewrite app.
- Không đổi UI tổng thể.
- Không xóa chức năng cũ.
- Chỉ sửa CSS/layout/i18n text ngắn gọn nếu thật sự cần cho vị trí hẹp như button/tab.
- Chiến lược đúng:
  - Chừa sẵn vùng text cố định thay vì để text quyết định kích thước khung.
  - Title reserve 2 dòng.
  - Subtitle/description reserve 2-3 dòng.
  - Tăng spacing/min-height cho card.
  - Button/input giữ height cố định.
  - Bottom nav dùng label ngắn, 1 dòng, ellipsis nếu cần.
  - Mobile layout ưu tiên dọc/full-width.
  - Khi đổi JP/VN, chỉ text thay đổi, DOM/class/layout không đổi.

## 4. Các màn cần test layout

- Intro
- Login
- Home
- Gửi yêu cầu
- Danh sách yêu cầu
- Chi tiết yêu cầu
- Lịch sử xử lý/timeline
- Bottom nav
- Profile/account nếu có

## 5. Cách test bắt buộc

- Test trên mobile/PWA thật.
- Test width 390px và 430px bằng DevTools.
- Chuyển JP -> VN -> JP ít nhất 5 lần.
- Kiểm tra card/button/nav/form/timeline không bị đè, chạm, hoặc nhảy mạnh.
- Nếu PWA không đổi sau deploy:
  - Clear service worker/cache.
  - Đóng/mở lại PWA.
  - Nếu vẫn không đổi, gỡ PWA cũ và cài lại.

## 6. Các nâng cấp để sau khi layout ổn

- Khôi phục dropdown “vấn đề cần giải quyết” trong form gửi yêu cầu, lấy từ nội dung công việc trong hồ sơ nhân viên.
- Tự động điền thông tin user khi gửi yêu cầu.
- Thêm nút quay về các màn con.
- Thêm màn chỉnh sửa thông tin tài khoản.
- Thêm nút xóa yêu cầu.
- Cải tiến timeline/lịch sử xử lý.
- Build/hoàn thiện Schedule module nếu chưa đạt yêu cầu thực tế.

## 7. Các file quan trọng đã hoặc có thể đã sửa

- `package.json`
- `server.js`
- `src/styles/app.css`
- `js/service-worker.js`
- `src/components/LegacyServiceWorkerCleanup.tsx`
- `src/App.tsx`
- `src/i18n/vi.ts`
- `src/i18n/ja.ts`
- Các service/module liên quan Schedule:
  - `src/services/scheduleService.ts`
  - `src/constants/scheduleStatus.ts`
  - `src/pages/schedule/SchedulePage.tsx`
  - `src/pages/requests/RequestDetailPage.tsx`

## 8. Quy tắc cho người tiếp tục

- Đọc các file sau trước khi làm:
  - `PROJECT_CONTEXT.md`
  - `API_CONTRACT.md`
  - `DEVELOPMENT_RULES.md`
  - `HANDOFF_CONTEXT.md`
- Continue from current codebase.
- Không tạo project mới.
- Không rewrite app.
- Không sửa lan man.
- Ưu tiên issue hiện tại: layout JP/VN mobile/PWA stability.
- Nếu sửa xong trong phiên này, commit và push để Render auto deploy.
