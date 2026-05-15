# HANDOFF CONTEXT

## 1. Current Deploy State

- Render URL: `https://yamaden.onrender.com`
- Render auto-deploys from `main` after `git push origin main`.
- Backend runs from `server.js` and serves the Vite production build from `dist`.
- `package.json` uses:
  - `build`: `vite build`
  - `start`: `node server.js`
  - `postinstall`: `npm run build`
- MongoDB and Cloudinary are active on Render.
- Cloudinary env names in use:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Legacy service worker/PWA cache cleanup exists:
  - `js/service-worker.js` unregisters/clears old cache.
  - `src/components/LegacyServiceWorkerCleanup.tsx` clears legacy `yamaden-support*` caches.
  - `server.js` serves `/js/service-worker.js` with `Cache-Control: no-store`.

## 2. Current Product State

- User approval flow is working.
- Main request create form is working.
- Issue dropdown exists and sends `issueTags`.
- Image/video picker and preview work.
- Image/video upload works through multer + Cloudinary.
- Cloudinary upload is OK.
- Requests with media are created successfully in MongoDB.
- Duplicate-looking admin request entries were addressed:
  - customer form has a duplicate-submit guard.
  - admin request list no longer merges localStorage request cache with backend rows.
- Customer request detail syncs status with admin/backend.
- Customer request detail has an icon refresh button.
- Refresh refetches latest request detail without polling.
- Media in customer detail renders thumbnail/video preview instead of raw Cloudinary URL.
- Request detail supports `mediaFiles` first, with fallback to `mediaUrl`, `image`, and old `images`.
- Admin status update pushes timeline object entries.

## 3. Important Current Status Mapping

Backend/admin status values currently used:

- `untreated`: Chua xu ly / 未対応
- `processing`: Dang xu ly / 対応中
- `estimating`: Dang bao gia / 見積中
- `quoted`: Da bao gia / 見積済み
- `ordered`: Da nhan don / 受注済み
- `completed`: Hoan thanh / 完了
- `lost`: Khong hoan thanh / 未完了

Customer request detail uses backend/MongoDB as source of truth:

- `request.status`
- `request.timeline`
- `request.adminReply`
- fallback fields: `adminResponse`, `response`, `feedback`, `note`, `timeline.note`

Do not map `estimating` or `quoted` back to `waiting_customer`; that was the source of the old wrong "Cho phan hoi" display.

## 4. Latest Completed Work

Latest completed customer detail work:

- Status/timeline sync with admin is done.
- Refresh icon is placed in the request detail header beside the status badge.
- Refresh calls `requestService.getRequestById(id)`, which fetches `/request/:id` with `cache: "no-store"` and updates Zustand store.
- Media grid in detail is already fixed.
- Timeline UI was updated to split each item into:
  - status label
  - timestamp
  - note, only if present
- Timeline classes added:
  - `.request-timeline-list`
  - `.request-timeline-item`
  - `.request-timeline-dot`
  - `.request-timeline-content`
  - `.request-timeline-status`
  - `.request-timeline-time`
  - `.request-timeline-note`
- Date/time formatting in customer detail is handled by `formatTimelineDate()` in `src/pages/requests/RequestDetailPage.tsx`.

## 5. Next Priority

Priority order for the next session:

1. Re-test timeline UI on real mobile/PWA after deploy:
   - confirm status/time/note no longer stick together.
   - confirm JP -> VN -> JP language switching does not break layout.
2. Add "Nguoi phu trach" / assigned staff display in customer detail.
3. Add staff profile viewing from customer/admin where needed.
4. Then add smaller navigation/account features:
   - back button on sub pages.
   - profile edit.
   - delete request.
5. After that, handle remaining admin bugs.

Do not start new feature work before confirming the latest timeline/detail deploy on mobile/PWA.

## 6. Areas To Avoid Touching Unless Asked

- Do not rewrite the app.
- Do not change upload provider.
- Do not change Cloudinary env names.
- Do not touch upload backend unless upload breaks again.
- Do not touch user approval flow unless explicitly requested.
- Do not redo the issue dropdown unless there is a specific bug.
- Do not make large admin UI redesigns.
- Do not remove old compatibility fields such as `image`, `mediaUrl`, or `images`.

## 7. Files Recently Important

- `server.js`
  - request schema
  - upload route
  - admin status update route
  - timeline object push
- `src/pages/requests/RequestCreatePage.tsx`
  - request form
  - issue dropdown
  - media picker
  - duplicate submit guard
- `src/pages/requests/RequestDetailPage.tsx`
  - customer detail
  - refresh icon
  - status/timeline rendering
  - admin reply rendering
  - media thumbnail/video rendering
- `src/services/requestService.ts`
  - backend request normalization
  - status mapping
  - media normalization
  - request detail refetch/update store
- `src/types.ts`
  - request status and media types
- `src/constants/requestStatus.ts`
  - status label/timeline i18n keys
- `src/components/ui/StatusBadge.tsx`
  - customer status badge labels
- `src/styles/app.css`
  - mobile layout
  - issue dropdown styles
  - media grid
  - timeline layout
- `src/i18n/vi.ts`
- `src/i18n/ja.ts`
- `js/admin.js`
  - admin request list
  - no longer merge localStorage requests into backend request list

## 8. Required Read Before Continuing

Before the next coding session, read:

- `PROJECT_CONTEXT.md`
- `API_CONTRACT.md`
- `DEVELOPMENT_RULES.md`
- `HANDOFF_CONTEXT.md`

Then continue from the current codebase. Do not create a new project.

## 9. Testing Checklist For Next Session

- Run `npm run build`.
- On mobile/PWA or DevTools 390px/430px:
  - login as active user.
  - create request with issue tags.
  - create request with media.
  - open customer request detail.
  - update status in admin.
  - click refresh in customer detail.
  - verify status, timeline, admin reply, media preview.
  - switch JP -> VN -> JP at least 3 times.
- If PWA does not reflect latest deploy:
  - clear browser cache/service worker.
  - close and reopen PWA.
  - reinstall PWA only if needed.
