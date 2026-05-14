# PROJECT CONTEXT

## Overview

YAMADEN is now a mobile-first web SPA built as a clean product foundation, not as patches on the old app.

Current stack:

- Vite
- React
- TypeScript
- React Router
- Zustand with localStorage persistence
- Component-based UI
- Service layer for business/data flow
- vi/ja i18n dictionaries

The app is designed to behave like a real mobile app inside the browser.

## Architecture

The app is organized around clear boundaries:

- `src/App.tsx`: route definitions and auth gate.
- `src/layouts/AppShell.tsx`: authenticated mobile app shell.
- `src/layouts/AuthLayout.tsx`: auth/welcome/profile/pending screens.
- `src/pages`: route-level screens grouped by module.
- `src/components`: reusable UI and domain components.
- `src/services`: mock API/service layer backed by Zustand + localStorage.
- `src/stores/appStore.ts`: persisted application state.
- `src/i18n`: vi/ja dictionaries and translation helper.
- `src/types.ts`: shared domain models and enums.
- `src/data/mockData.ts`: initial mock seed data.

Authenticated layout:

```tsx
<AppShell>
  <TopBar fixed />
  <MainContent scrollable />
  <BottomTab fixed />
</AppShell>
```

Layout rule:

- Header/top bar is fixed.
- Bottom tab is fixed.
- Only main content scrolls.
- The whole page must not scroll.

Core CSS expectation:

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

## Completed Modules

### Request Module

Status: QA pass.

Implemented:

- Request list
- Create request
- Request detail
- Timeline
- Search/filter
- Loading state
- Empty state
- Error state
- Validation
- LocalStorage persistence
- Service layer access only

Main files:

- `src/pages/requests/RequestsPage.tsx`
- `src/pages/requests/RequestCreatePage.tsx`
- `src/pages/requests/RequestDetailPage.tsx`
- `src/services/requestService.ts`
- `src/components/requests/RequestCard.tsx`
- `src/components/Timeline.tsx`
- `src/components/ui/StatusBadge.tsx`

### Quote Module

Status: QA pass.

Implemented:

- Quote list
- Quote detail
- Quote status actions
- Quote total calculation
- VAT calculation
- Service layer access only

Main files:

- `src/pages/quotes/QuotesPage.tsx`
- `src/pages/quotes/QuoteDetailPage.tsx`
- `src/services/quoteService.ts`
- `src/components/quotes/QuoteCard.tsx`
- `src/constants/quoteStatus.ts`

### Request <-> Quote Sync

Status: completed and QA pass.

Implemented business flow:

- Each quote has `requestId`.
- `quoteService.getQuotesByRequestId(requestId)` returns quotes linked to a request.
- Approving a quote:
  - updates quote status to `approved`
  - updates linked request status to `scheduled`
  - adds request timeline event `request.timelineQuoteApproved`
- Requesting quote revision:
  - updates quote status to `revision_requested`
  - updates linked request status to `waiting_customer`
  - adds request timeline event `request.timelineQuoteRevision`
- Request detail displays related quote cards if linked quotes exist.

All sync happens through service layer. UI must not directly update store state.

## Service Layer Pattern

Pages and components must call services instead of reading/writing persistence directly.

Current service pattern:

- Read from Zustand state first.
- Fall back to localStorage persisted state.
- Fall back to mock seed data.
- Normalize old/missing fields if needed.
- Commit state back to Zustand.
- Let Zustand persist to localStorage.

Example flow:

```txt
UI action
  -> service method
  -> service reads current state
  -> service applies business rule
  -> service commits updated state
  -> UI receives updated model
```

Services currently available:

- `requestService`
- `quoteService`

Next modules should follow the same pattern.

## i18n

Languages:

- Vietnamese: `vi`
- Japanese: `ja`

Files:

- `src/i18n/vi.ts`
- `src/i18n/ja.ts`
- `src/i18n/index.ts`
- `src/hooks/useTranslation.ts`

Rule:

- No hardcoded user-facing text in pages/components.
- Use `t("key.path")`.
- Language switch updates in realtime without reload.

## Current User Flow

User statuses:

- `notLoggedIn`
- `profileIncomplete`
- `pendingApproval`
- `active`
- `rejected`

Flow:

```txt
Welcome
  -> Register
  -> Profile setup
  -> Pending approval
  -> Admin approval
  -> Login
  -> Main app
```

Main app tabs:

1. Home
2. Requests
3. Quotes
4. Schedule
5. Account

## Current Data Flow

Requests:

- Created through `requestService.createRequest`.
- Updated through `requestService.updateRequest`.
- Timeline updated through `requestService.addTimelineEvent`.

Quotes:

- Listed through `quoteService.getQuotes`.
- Read through `quoteService.getQuoteById`.
- Linked to request through `quoteService.getQuotesByRequestId`.
- Approved through `quoteService.approveQuote`.
- Revision requested through `quoteService.requestRevision`.

## Next Step

Next module: Schedule module.

Planned work:

- Create `scheduleService`.
- Define schedule data model clearly.
- Build Schedule list/detail flow.
- Link schedule to request after quote approval if needed.
- Add timeline/progress UI.
- Run QA before moving to the next module.
