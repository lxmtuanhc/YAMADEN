# YAMADEN Support - split structure

Cấu trúc đã tách từ file HTML lớn:

```txt
index.html
css/main.css
css/auth.css
js/app.js
js/auth.js
service-worker.js
```

## Cách copy lên repo

```bash
git add index.html css/main.css css/auth.css js/app.js js/auth.js service-worker.js
git commit -m "Refactor app into separate CSS and JS files"
git push
```

## Ghi chú

- `main.css`: layout chung, home, request, profile, settings, mobile shell.
- `auth.css`: login, register, pending approval, các fix UI auth.
- `app.js`: logic chính của app và danh mục yêu cầu.
- `auth.js`: logic/fix riêng cho màn hình đăng nhập, đăng ký, chờ duyệt và đổi ngôn ngữ.
- `service-worker.js`: đã thêm cache cho các file CSS/JS mới và tăng version lên `v49`.
