# DEVELOPMENT RULES

These rules keep the project clean, consistent, and ready to replace mock/localStorage services with a real backend later.

## 1. No Hardcoded UI Text

Do not hardcode user-facing text in pages or components.

Use i18n keys:

```tsx
const { t } = useTranslation();

return <h1>{t("request.title")}</h1>;
```

Add every new text key to both:

- `src/i18n/vi.ts`
- `src/i18n/ja.ts`

Language switch must work realtime without page reload.

## 2. Use i18n Everywhere

All visible labels, titles, buttons, validation messages, status labels, empty states, and error states must use `t(key)`.

Allowed exceptions:

- IDs like `RQ-2024-0428`
- User-entered data
- Mock data values
- Technical constants not shown to users

## 3. UI Must Not Access Store Directly For Business Data

Pages/components must not directly update request, quote, or schedule state.

Do not do this in UI:

```tsx
useAppStore.setState(...)
localStorage.setItem(...)
```

Do this instead:

```tsx
await requestService.createRequest(input);
await quoteService.approveQuote(id);
```

The UI can read lightweight app state where appropriate, such as language or auth status, but business module changes must go through service layer.

## 4. Use Service Layer

All business/data flow belongs in services.

Current services:

- `requestService`
- `quoteService`

Next service:

- `scheduleService`

Service responsibilities:

- read current data
- normalize old persisted data if needed
- validate or prepare data where appropriate
- apply business rules
- update Zustand state
- let persistence happen through Zustand/localStorage
- return updated domain model to UI

Service methods should be named after business actions when the action has side effects.

Good:

```ts
quoteService.approveQuote(id);
quoteService.requestRevision(id);
requestService.addTimelineEvent(id, input);
```

Avoid putting side-effect rules directly inside page components.

## 5. Fixed Mobile Layout

The app must behave like a mobile app:

- TopBar fixed.
- BottomTab fixed.
- Only the content area scrolls.
- Do not allow full page/body scroll.

Required layout model:

```txt
AppShell
  TopBar fixed
  MainContent scrollable
  BottomTab fixed
```

CSS rule:

```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
}
```

Do not introduce layouts where the entire document scrolls.

## 6. One Module At A Time

Work module by module.

Current order:

1. Request module: complete, QA pass.
2. Quote module: complete, QA pass.
3. Request <-> Quote sync: complete, QA pass.
4. Schedule module: next.

Do not start a new module before the current module has:

- data model
- service layer
- pages
- reusable components
- i18n keys
- QA pass

## 7. QA Before Next Module

Before moving to the next module, run a QA checklist.

Minimum QA:

- Build passes with `npm run build`.
- Main happy path works in browser.
- Data persists after reload where required.
- i18n vi/ja works without reload.
- Fixed layout still holds: only main content scrolls.
- UI does not access store directly for module business flow.
- Service layer handles state update.
- Empty/loading/error states behave correctly.

Module-specific QA must be added before shipping each module.

## 8. Reusable Components First

Prefer existing reusable components before creating new UI.

Current reusable components include:

- `Button`
- `Card`
- `SearchBar`
- `StatusBadge`
- `Timeline`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `RequestCard`
- `QuoteCard`

New modules should add reusable components only when the pattern is shared or likely to be reused.

## 9. Keep UI Consistent

Style direction:

- Mobile-first
- Max width around 430px
- White / light blue background
- Blue primary accent
- Rounded cards
- Light shadow
- Clean Japanese enterprise app style
- No strong gradients
- No noisy layouts

Do not redesign existing completed modules unless the user explicitly asks.

## 10. Preserve Clean Architecture

Do not return to patch-style code.

Avoid:

- appending unrelated logic at the bottom of large files
- mixing auth/main app logic
- writing module logic inside shared layout
- direct localStorage reads in pages
- duplicate status strings across components
- hardcoded translations

Prefer:

- typed domain models
- constants for status metadata
- service methods for business flow
- small route pages
- reusable components
- clear module folders

## 11. Git Hygiene

Only stage files related to the current task.

If unrelated files are already present, leave them untouched unless the user asks to include them.

Before commit:

```txt
git status --short
git diff --cached --stat
```

After meaningful changes:

```txt
npm run build
```

Then commit and push when requested by the user.
