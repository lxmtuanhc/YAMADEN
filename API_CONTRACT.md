# API CONTRACT

This document defines the future backend API contract for the current SPA.

Current implementation uses mock data + localStorage through service layer. When replacing mock services with real APIs, keep the same domain model and response shape where possible.

Base URL example:

```txt
/api
```

Common response envelope:

```ts
type ApiResponse<T> = {
  data: T;
  message?: string;
};
```

Common error response:

```ts
type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};
```

## Status Enums

### UserStatus

```ts
type UserStatus =
  | "notLoggedIn"
  | "profileIncomplete"
  | "pendingApproval"
  | "active"
  | "rejected";
```

### RequestStatus

```ts
type RequestStatus =
  | "submitted"
  | "received"
  | "processing"
  | "waiting_customer"
  | "scheduled"
  | "completed"
  | "cancelled";
```

### QuoteStatus

```ts
type QuoteStatus =
  | "pending"
  | "approved"
  | "revision_requested"
  | "expired";
```

### ScheduleStatus

```ts
type ScheduleStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled";
```

## Auth API

### Register

Method: `POST`

Endpoint:

```txt
/api/auth/register
```

Request body:

```ts
{
  phone: string;
  pin: string;
}
```

Response:

```ts
ApiResponse<{
  user: User;
  status: "profileIncomplete";
}>
```

### Save Profile

Method: `POST`

Endpoint:

```txt
/api/auth/profile
```

Request body:

```ts
{
  name: string;
  email: string;
  address: string;
  projectName: string;
  companyType: string;
}
```

Response:

```ts
ApiResponse<{
  user: User;
  status: "pendingApproval";
}>
```

### Login

Method: `POST`

Endpoint:

```txt
/api/auth/login
```

Request body:

```ts
{
  phone: string;
  pin: string;
}
```

Response:

```ts
ApiResponse<{
  user: User;
  token: string;
}>
```

### Logout

Method: `POST`

Endpoint:

```txt
/api/auth/logout
```

Request body:

```ts
{}
```

Response:

```ts
ApiResponse<{
  success: true;
}>
```

## Request API

### Get Requests

Method: `GET`

Endpoint:

```txt
/api/requests
```

Query params:

```ts
{
  status?: RequestStatus | "all";
  search?: string;
}
```

Response:

```ts
ApiResponse<Request[]>
```

### Get Request By ID

Method: `GET`

Endpoint:

```txt
/api/requests/:id
```

Response:

```ts
ApiResponse<Request>
```

### Create Request

Method: `POST`

Endpoint:

```txt
/api/requests
```

Request body:

```ts
{
  category: string;
  title: string;
  description: string;
  address: string;
  datetime?: string;
  images?: string[];
}
```

Response:

```ts
ApiResponse<Request>
```

Validation:

- `title` is required.
- `description` is required.
- `address` is required.

### Update Request

Method: `PATCH`

Endpoint:

```txt
/api/requests/:id
```

Request body:

```ts
Partial<{
  category: string;
  title: string;
  description: string;
  address: string;
  datetime: string;
  images: string[];
  status: RequestStatus;
}>
```

Response:

```ts
ApiResponse<Request>
```

### Add Request Timeline Event

Method: `POST`

Endpoint:

```txt
/api/requests/:id/timeline
```

Request body:

```ts
{
  type: RequestStatus;
  message: string;
  createdAt?: string;
}
```

Response:

```ts
ApiResponse<Request>
```

## Quote API

### Get Quotes

Method: `GET`

Endpoint:

```txt
/api/quotes
```

Query params:

```ts
{
  status?: QuoteStatus | "all";
  search?: string;
  requestId?: string;
}
```

Response:

```ts
ApiResponse<Quote[]>
```

### Get Quote By ID

Method: `GET`

Endpoint:

```txt
/api/quotes/:id
```

Response:

```ts
ApiResponse<Quote>
```

### Get Quotes By Request ID

Method: `GET`

Endpoint:

```txt
/api/requests/:requestId/quotes
```

Response:

```ts
ApiResponse<Quote[]>
```

### Update Quote

Method: `PATCH`

Endpoint:

```txt
/api/quotes/:id
```

Request body:

```ts
Partial<{
  status: QuoteStatus;
  validUntil: string;
  projectName: string;
  items: QuoteItem[];
}>
```

Response:

```ts
ApiResponse<Quote>
```

### Approve Quote

Method: `POST`

Endpoint:

```txt
/api/quotes/:id/approve
```

Request body:

```ts
{}
```

Business effects:

- `quote.status = "approved"`
- linked `request.status = "scheduled"`
- add request timeline event: `request.timelineQuoteApproved`

Response:

```ts
ApiResponse<{
  quote: Quote;
  request: Request;
}>
```

### Request Quote Revision

Method: `POST`

Endpoint:

```txt
/api/quotes/:id/request-revision
```

Request body:

```ts
{
  reason?: string;
}
```

Business effects:

- `quote.status = "revision_requested"`
- linked `request.status = "waiting_customer"`
- add request timeline event: `request.timelineQuoteRevision`

Response:

```ts
ApiResponse<{
  quote: Quote;
  request: Request;
}>
```

## Schedule API

### Get Schedules

Method: `GET`

Endpoint:

```txt
/api/schedules
```

Query params:

```ts
{
  status?: ScheduleStatus | "all";
  requestId?: string;
}
```

Response:

```ts
ApiResponse<Schedule[]>
```

### Get Schedule By ID

Method: `GET`

Endpoint:

```txt
/api/schedules/:id
```

Response:

```ts
ApiResponse<Schedule>
```

### Create Schedule

Method: `POST`

Endpoint:

```txt
/api/schedules
```

Request body:

```ts
{
  requestId: string;
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status: ScheduleStatus;
}
```

Response:

```ts
ApiResponse<Schedule>
```

### Update Schedule

Method: `PATCH`

Endpoint:

```txt
/api/schedules/:id
```

Request body:

```ts
Partial<{
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status: ScheduleStatus;
}>
```

Response:

```ts
ApiResponse<Schedule>
```

## Domain Models

```ts
type User = {
  id: string;
  phone: string;
  pin?: string;
  name: string;
  email: string;
  status: UserStatus;
  address?: string;
  projectName?: string;
  companyType?: string;
};

type Request = {
  id: string;
  title: string;
  category: string;
  description: string;
  address: string;
  status: RequestStatus;
  createdAt: string;
  images: string[];
  timeline: TimelineEvent[];
  datetime?: string;
  projectName?: string;
  createdBy?: string;
};

type TimelineEvent = {
  id: string;
  type: RequestStatus;
  message: string;
  createdAt: string;
};

type Quote = {
  id: string;
  requestId: string;
  projectName: string;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
};

type QuoteItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type Schedule = {
  id: string;
  requestId: string;
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status: ScheduleStatus;
};
```
