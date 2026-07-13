# PactFlow — Complete REST API Specification

> **Authority:** Governed by PROJECT_CONSTITUTION.md and DOMAIN_MODEL.md  
> **API Version:** v1  
> **Base URL:** `https://api.pactflow.io/api/v1`  
> **Protocol:** HTTPS only. HTTP connections are rejected with 301.  
> **Last Updated:** 2026-07-12  

---

## Part 1 — Global Conventions

### 1.1 Versioning Strategy

- **Strategy:** URI path versioning — `/api/v1/...`
- `v1` is the current stable version.
- Breaking changes introduce `v2` with a 12-month deprecation window using `Deprecation` and `Sunset` response headers.
- Non-breaking additions rolled into current version without a version bump.
- Experimental endpoints use `/api/beta/` prefix.

### 1.2 REST Naming Conventions

| Rule | Example |
|---|---|
| Resources are nouns, plural | `/projects`, `/milestones` |
| Sub-resources express ownership | `/projects/{projectId}/milestones` |
| Actions use verb sub-resources | `POST /milestones/{id}/submit` |
| IDs in path are UUID v7 | `/projects/01923abc-...` |
| Query parameters are camelCase | `?pageSize=20&sortBy=createdAt` |
| Response fields are camelCase | `{ "createdAt": "..." }` |
| Timestamps are ISO 8601 UTC | `"2026-07-12T06:30:00Z"` |
| Monetary amounts are strings, 7 decimals | `"amount": "100.0000000"` |
| Asset code always explicit | `"assetCode": "XLM"` |

### 1.3 Global Error Response Format (RFC 7807 Problem Details)

```json
{
  "type": "https://api.pactflow.io/errors/{error-code}",
  "title": "Human-readable error title",
  "status": 422,
  "detail": "Detailed explanation of what went wrong.",
  "instance": "/api/v1/projects/01923abc-...",
  "timestamp": "2026-07-12T06:30:00Z",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": [
    {
      "field": "title",
      "code": "FIELD_TOO_SHORT",
      "message": "Title must be at least 5 characters."
    }
  ]
}
```

`errors[]` is only present on 422 validation failures.

#### Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 202 | Accepted (async) |
| 204 | No Content |
| 400 | Bad Request — malformed JSON/types |
| 401 | Unauthorized — missing/invalid JWT |
| 403 | Forbidden — insufficient role or ownership |
| 404 | Not Found |
| 409 | Conflict — business rule or state machine violation |
| 410 | Gone — permanently deleted (GDPR) |
| 422 | Unprocessable Entity — validation failure |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### 1.4 Validation Strategy

- **Layer 1 (400):** JSON structure and type correctness
- **Layer 2 (422):** Field-level rules — returns `errors[]` array
- **Layer 3 (409):** Business rule invariants — returns single `detail`
- **Layer 4 (403):** Resource ownership and authorization

### 1.5 Pagination Envelope

All list endpoints return:

```json
{
  "data": [ ...items ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 142,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Standard query params: `page` (default 1), `pageSize` (default 20, max 100), `sortBy`, `sortDir` (asc/desc).

### 1.6 JWT Authentication Flow

```
1. POST /auth/login → accessToken (JWT, 15 min) + refreshToken (opaque, 30 days)
2. Include: Authorization: Bearer <accessToken> on all requests
3. On 401: POST /auth/refresh → new accessToken + rotated refreshToken
4. On logout: POST /auth/logout → server invalidates refreshToken hash in DB
```

JWT Payload:
```json
{
  "sub": "01923abc-...",
  "email": "user@example.com",
  "accountType": "FREELANCER",
  "sessionId": "01923def-...",
  "iat": 1720776000,
  "exp": 1720776900
}
```

Security: accountType in JWT is routing hint only; authorization always re-validated server-side.

### 1.7 Wallet Signature Authentication Flow

```
1. GET /wallets/challenge?publicKey=G... → { "nonce": "PactFlow-Auth-<uuid>-<ts>", "expiresAt": "..." }
2. Client signs nonce with Stellar private key via wallet extension
3. POST /wallets with { publicKey, signature, nonce, walletProvider }
4. Server verifies: nonce not expired, Ed25519 signature valid, key not linked elsewhere
5. On success: wallet linked with verified_at = NOW()
```

### 1.8 Rate Limiting Strategy

| Tier | Scope | Limit | Window |
|---|---|---|---|
| Global unauthenticated | Per IP | 60 req | 1 min |
| Global authenticated | Per user | 300 req | 1 min |
| Auth endpoints | Per IP | 10 req | 1 min |
| Wallet challenge | Per IP | 5 req | 1 min |
| Mutation endpoints | Per user | 60 req | 1 min |

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. On exceeded: `429` with `Retry-After`.

### 1.9 Idempotency Rules

- Optional `Idempotency-Key: <uuid>` header on all POST endpoints.
- Same key replayed within 24h returns original response without re-execution.
- Same key with different body returns `422`.

### 1.10 API Security Best Practices

1. HTTPS only — HTTP redirected to HTTPS
2. CORS — Only `https://pactflow.io` and `https://app.pactflow.io` allowed
3. Content-Type: `application/json` required on all body requests
4. Max request body: 512 KB
5. No sensitive data in URLs (tokens/keys always in body or headers)
6. Security response headers: `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
7. Audit logging of all auth events, wallet ops, and escrow mutations

---

## Part 2 — API Endpoints

---

## Domain 1: Authentication

### POST /api/v1/auth/register
**Description:** Register a new user (Company or Freelancer).  
**Auth:** No | **Rate Limit:** 10/min per IP

**Request:**
```json
{
  "email": "alice@example.com",
  "password": "Str0ng!Pass#2026",
  "accountType": "FREELANCER",
  "displayName": "Alice Chen",
  "timezone": "Asia/Kolkata"
}
```

**Validation:**
- `email`: Required, RFC 5322, max 320 chars, unique
- `password`: Required, min 10 chars, uppercase + lowercase + digit + special char
- `accountType`: Required, enum `[COMPANY, FREELANCER]`
- `displayName`: Required, 2–100 chars
- `timezone`: Optional, valid IANA timezone, default `UTC`

**Response 201:**
```json
{
  "id": "01923abc-...",
  "email": "alice@example.com",
  "accountType": "FREELANCER",
  "displayName": "Alice Chen",
  "isEmailVerified": false,
  "createdAt": "2026-07-12T06:30:00Z"
}
```

**Errors:** `409` Email taken | `422` Validation failure

---

### POST /api/v1/auth/login
**Description:** Authenticate, return JWT access and refresh tokens.  
**Auth:** No | **Idempotency-Key:** Supported

**Request:** `{ "email": "...", "password": "..." }`

**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "opaque-string",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": { "id": "...", "email": "...", "accountType": "FREELANCER", "displayName": "Alice Chen" }
}
```

**Errors:** `401` Invalid credentials | `403` Account deactivated

---

### POST /api/v1/auth/refresh
**Description:** Rotate refresh token, return new access token.  
**Auth:** No

**Request:** `{ "refreshToken": "opaque-string" }`  
**Response 200:** `{ "accessToken": "...", "refreshToken": "rotated-token", "tokenType": "Bearer", "expiresIn": 900 }`  
**Errors:** `401` Token invalid, expired, or replayed

---

### POST /api/v1/auth/logout
**Description:** Invalidate current session's refresh token.  
**Auth:** Yes

**Request:** `{ "refreshToken": "opaque-string" }`  
**Response:** `204 No Content`

---

### POST /api/v1/auth/verify-email
**Description:** Verify email using time-limited token from email.  
**Auth:** No

**Request:** `{ "token": "email-verification-token" }`  
**Response 200:** `{ "message": "Email successfully verified." }`  
**Errors:** `400` Malformed token | `410` Token expired or used

---

### POST /api/v1/auth/forgot-password
**Description:** Initiate password reset. Always returns 202 (prevents user enumeration).  
**Auth:** No | **Rate Limit:** 3/hour per IP

**Request:** `{ "email": "alice@example.com" }`  
**Response 202:** `{ "message": "If that email is registered, a reset link will be sent." }`

---

### POST /api/v1/auth/reset-password
**Description:** Reset password using reset token from email.  
**Auth:** No

**Request:** `{ "token": "reset-token", "newPassword": "NewStr0ng!Pass#2026" }`  
**Response 200:** `{ "message": "Password successfully reset. Please log in." }`  
**Errors:** `410` Token expired | `422` Password too weak

---

### GET /api/v1/auth/me
**Description:** Return authenticated user's full profile including wallets.  
**Auth:** Yes | **Roles:** All

**Response 200:**
```json
{
  "id": "01923abc-...",
  "email": "alice@example.com",
  "accountType": "FREELANCER",
  "displayName": "Alice Chen",
  "avatarUrl": "https://cdn.pactflow.io/avatars/alice.jpg",
  "timezone": "Asia/Kolkata",
  "bio": "Full-stack developer.",
  "isEmailVerified": true,
  "isActive": true,
  "wallets": [
    { "id": "...", "stellarPublicKey": "GABC...XYZ", "walletProvider": "FREIGHTER", "isPrimary": true, "verifiedAt": "2026-07-10T08:00:00Z" }
  ],
  "createdAt": "2026-07-08T12:00:00Z",
  "updatedAt": "2026-07-12T06:00:00Z"
}
```

---

## Domain 2: User Profile

### PATCH /api/v1/users/me
**Description:** Update own profile fields (PATCH semantics — all fields optional).  
**Auth:** Yes | **Roles:** COMPANY, FREELANCER

**Request:** `{ "displayName": "...", "avatarUrl": "...", "timezone": "...", "bio": "..." }`  
**Validation:** displayName 2–100 | avatarUrl valid HTTPS URL | timezone valid IANA | bio max 1000 chars  
**Response 200:** Updated user profile object  
**Errors:** `422` Validation failure

---

### DELETE /api/v1/users/me
**Description:** GDPR erasure request. Soft-deletes account and anonymises PII asynchronously.  
**Auth:** Yes

**Business Rules:** Rejected if any milestone is in `FUNDED`, `IN_PROGRESS`, or `SUBMITTED`.  
**Response 202:** `{ "message": "Account deletion scheduled. Data anonymised within 30 days." }`  
**Errors:** `409` Active escrows prevent deletion

---

### GET /api/v1/users/{userId}/profile
**Description:** Public profile of any user. Returns only non-sensitive fields.  
**Auth:** Yes

**Response 200:**
```json
{
  "id": "01923abc-...",
  "displayName": "Alice Chen",
  "accountType": "FREELANCER",
  "avatarUrl": "...",
  "bio": "Full-stack developer.",
  "memberSince": "2026-07-08T12:00:00Z"
}
```

**Errors:** `404` User not found or deleted

---

## Domain 3: Wallet Integration

### GET /api/v1/wallets/challenge
**Description:** Get one-time nonce to prove wallet ownership before linking.  
**Auth:** Yes | **Rate Limit:** 5/min per IP

**Query Params:** `publicKey` (required — Stellar G-address)

**Response 200:**
```json
{
  "nonce": "PactFlow-Auth-01923abc-1720776000",
  "publicKey": "GABC...XYZ",
  "expiresAt": "2026-07-12T06:35:00Z"
}
```

**Validation:** publicKey starts with `G`, 56 chars, valid Base32, not already linked  
**Errors:** `400` Invalid key format | `409` Key already linked

---

### GET /api/v1/wallets
**Description:** List all wallet connections for authenticated user.  
**Auth:** Yes

**Response 200:**
```json
{
  "data": [
    { "id": "...", "stellarPublicKey": "GABC...XYZ", "walletProvider": "FREIGHTER", "isPrimary": true, "verifiedAt": "...", "createdAt": "..." }
  ]
}
```

---

### POST /api/v1/wallets
**Description:** Link and cryptographically verify a Stellar wallet.  
**Auth:** Yes | **Idempotency-Key:** Supported

**Request:**
```json
{
  "publicKey": "GABC...XYZ",
  "signature": "base64-ed25519-signature",
  "nonce": "PactFlow-Auth-01923abc-1720776000",
  "walletProvider": "FREIGHTER",
  "isPrimary": true
}
```

**Server Verification:**
1. Nonce exists, was issued for this publicKey, not expired (5-min TTL)
2. Ed25519 signature valid: `verify(nonce_bytes, sig_bytes, pubkey_bytes)`
3. publicKey not linked to another account

**Response 201:** `{ "id": "...", "stellarPublicKey": "...", "walletProvider": "FREIGHTER", "isPrimary": true, "verifiedAt": "..." }`  
**Errors:** `400` Invalid signature or expired nonce | `409` Key already linked

---

### PATCH /api/v1/wallets/{walletId}/set-primary
**Description:** Set wallet as primary. Demotes existing primary.  
**Auth:** Yes

**Response 200:** Updated wallet object  
**Errors:** `403` Not owner | `404` Not found

---

### DELETE /api/v1/wallets/{walletId}
**Description:** Unlink (soft-delete) a wallet.  
**Auth:** Yes

**Business Rules:** Cannot delete if referenced in active escrow.  
**Response:** `204 No Content`  
**Errors:** `403` Not owner | `409` Active escrow recipient

---

## Domain 4: Projects

### GET /api/v1/projects
**Description:** List projects for the authenticated user (client's own / freelancer's assigned).  
**Auth:** Yes | **Roles:** COMPANY, FREELANCER

**Query Params:** `status`, `search`, `page`, `pageSize`, `sortBy` (createdAt|deadline|title|totalBudgetXlm), `sortDir`

**Response 200:**
```json
{
  "data": [
    {
      "id": "01923ghi-...",
      "title": "DeFi Dashboard Redesign",
      "status": "IN_PROGRESS",
      "totalBudgetXlm": "500.0000000",
      "assetCode": "XLM",
      "deadline": "2026-09-01",
      "milestonesCount": 4,
      "milestonesCompleted": 1,
      "client": { "id": "...", "displayName": "Stellar Ventures", "avatarUrl": "..." },
      "assignee": { "id": "...", "displayName": "Alice Chen", "avatarUrl": "..." },
      "createdAt": "2026-07-01T09:00:00Z",
      "updatedAt": "2026-07-10T15:30:00Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 5, "totalPages": 1, "hasNextPage": false, "hasPreviousPage": false }
}
```

---

### POST /api/v1/projects
**Description:** Create a new project. COMPANY role only.  
**Auth:** Yes | **Roles:** COMPANY | **Idempotency-Key:** Supported

**Request:**
```json
{
  "title": "DeFi Dashboard Redesign",
  "description": "Complete redesign of our Stellar DeFi dashboard.",
  "assigneeId": "01923abc-...",
  "totalBudgetXlm": "500.0000000",
  "assetCode": "XLM",
  "deadline": "2026-09-01"
}
```

**Validation:** title 5–200 chars | description max 5000 | assigneeId must be FREELANCER user and not self | totalBudgetXlm > 0 | deadline must be future date  
**Business Rules:** assigneeId != authenticated user's id  
**Response 201:** Full project object with status `DRAFT`  
**Errors:** `403` Not COMPANY | `404` assigneeId not found | `409` assigneeId not FREELANCER | `422` Validation

---

### GET /api/v1/projects/{projectId}
**Description:** Full project detail including milestone summaries.  
**Auth:** Yes | **Access:** Project client or assignee or ADMIN

**Response 200:** Full project object with nested milestones array (id, title, status, amountXlm, sequenceOrder, dueDate)  
**Errors:** `403` Not participant | `404` Not found

---

### PATCH /api/v1/projects/{projectId}
**Description:** Update editable project fields. Only in DRAFT status.  
**Auth:** Yes | **Roles:** COMPANY (client only)

**Request (all optional):** `{ "title": "...", "description": "...", "deadline": "..." }`  
**Business Rules:** totalBudgetXlm and assigneeId immutable once milestones created. Edit only in DRAFT.  
**Response 200:** Updated project object  
**Errors:** `403` Not client | `409` Not DRAFT or has funded milestones

---

### POST /api/v1/projects/{projectId}/cancel
**Description:** Cancel a project. Forbidden with active milestone escrows.  
**Auth:** Yes | **Roles:** COMPANY (client only)

**Request:** `{ "reason": "Scope changed." }`  
**Business Rules:** Forbidden if any milestone in FUNDED | IN_PROGRESS | SUBMITTED  
**Response 200:** `{ "id": "...", "status": "CANCELLED", "updatedAt": "..." }`  
**Errors:** `409` Active milestones prevent cancellation

---

## Domain 5: Milestones

### GET /api/v1/projects/{projectId}/milestones
**Description:** List all milestones for a project, ordered by sequenceOrder.  
**Auth:** Yes | **Access:** Project participants

**Query Params:** `status`

**Response 200:** Paginated milestones with escrow summary per milestone.

---

### POST /api/v1/projects/{projectId}/milestones
**Description:** Add a new milestone. DRAFT or IN_PROGRESS project only.  
**Auth:** Yes | **Roles:** COMPANY (client only)

**Request:**
```json
{
  "title": "Wireframes & Design System",
  "description": "Deliver wireframes in Figma.",
  "amountXlm": "100.0000000",
  "assetCode": "XLM",
  "dueDate": "2026-07-25",
  "isStrictDeadline": false,
  "sequenceOrder": 1
}
```

**Validation:** title 3–200 | amountXlm > 0 | sequenceOrder positive integer, unique in project  
**Business Rules:** Sum of all milestone amounts must not exceed project totalBudgetXlm  
**Response 201:** Full milestone object (escrow null until funded)  
**Errors:** `403` Not client | `409` sequenceOrder conflict or budget exceeded | `422` Validation

---

### GET /api/v1/projects/{projectId}/milestones/{milestoneId}
**Description:** Full milestone detail with escrow status and deliverables.  
**Auth:** Yes | **Access:** Project participants

**Response 200:**
```json
{
  "id": "01923mno-...",
  "projectId": "01923ghi-...",
  "title": "Wireframes & Design System",
  "amountXlm": "100.0000000",
  "assetCode": "XLM",
  "status": "SUBMITTED",
  "sequenceOrder": 1,
  "dueDate": "2026-07-25",
  "isStrictDeadline": false,
  "escrow": {
    "id": "...", "contractAddress": "CABC...123", "escrowStatus": "ACTIVE",
    "lockedAmountXlm": "100.0000000", "clientWalletAddress": "GCLIENT...XYZ",
    "freelancerWalletAddress": "GFREE...XYZ", "fundedAt": "2026-07-12T06:00:00Z"
  },
  "deliverables": [
    { "id": "...", "title": "Figma v1", "deliveryUrl": "https://figma.com/...", "deliveryType": "FIGMA", "submittedAt": "..." }
  ],
  "createdAt": "...", "updatedAt": "..."
}
```

---

### PATCH /api/v1/projects/{projectId}/milestones/{milestoneId}
**Description:** Update milestone fields. DRAFT status only.  
**Auth:** Yes | **Roles:** COMPANY (client only)

**Request (all optional):** `{ "title": "...", "description": "...", "dueDate": "...", "isStrictDeadline": true }`  
**Business Rules:** amountXlm and sequenceOrder immutable past DRAFT  
**Response 200:** Updated milestone object  
**Errors:** `403` Not client | `409` Not DRAFT

---

### DELETE /api/v1/projects/{projectId}/milestones/{milestoneId}
**Description:** Soft-delete a milestone. DRAFT only, no escrow attached.  
**Auth:** Yes | **Roles:** COMPANY (client only)  
**Response:** `204 No Content`  
**Errors:** `403` Not client | `409` Has escrow contract

---

### POST /api/v1/projects/{projectId}/milestones/{milestoneId}/start
**Description:** Freelancer marks a FUNDED milestone as IN_PROGRESS.  
**Auth:** Yes | **Roles:** FREELANCER (assignee only)

**Business Rules:** Milestone must be FUNDED  
**Response 200:** `{ "id": "...", "status": "IN_PROGRESS", "updatedAt": "..." }`  
**Errors:** `403` Not assignee | `409` Not FUNDED

---

### POST /api/v1/projects/{projectId}/milestones/{milestoneId}/submit
**Description:** Freelancer submits deliverables for a milestone.  
**Auth:** Yes | **Roles:** FREELANCER (assignee only)

**Request:**
```json
{
  "deliverables": [
    { "title": "Figma Wireframes v1", "description": "...", "deliveryUrl": "https://figma.com/file/...", "deliveryType": "FIGMA" },
    { "title": "GitHub PR", "description": "...", "deliveryUrl": "https://github.com/.../pull/42", "deliveryType": "GITHUB_PR" }
  ]
}
```

**Validation:** deliverables min 1 | each: title required, deliveryUrl valid HTTPS, deliveryType enum  
**Business Rules:** Milestone must be IN_PROGRESS  
**Response 200:** Updated milestone with new deliverables  
**Errors:** `403` Not assignee | `409` Not IN_PROGRESS

---

### POST /api/v1/projects/{projectId}/milestones/{milestoneId}/approve
**Description:** Client approves submitted work. Returns unsigned Soroban payment release transaction XDR.  
**Auth:** Yes | **Roles:** COMPANY (client only)

**Business Rules:** Milestone must be SUBMITTED. Escrow must be ACTIVE.  
**Response 200:**
```json
{
  "milestoneId": "01923mno-...",
  "action": "PAYMENT_RELEASE",
  "unsignedTransactionXdr": "AAAA...base64-xdr...",
  "contractAddress": "CABC...123",
  "amountXlm": "100.0000000",
  "freelancerWalletAddress": "GFREE...XYZ",
  "instructions": "Sign this XDR with your wallet to release payment."
}
```

> **Architecture Note:** Backend builds the unsigned Soroban envelope and returns it. Client-side wallet signs and submits. Milestone remains SUBMITTED until ingestion daemon detects `PaymentReleased` on-chain event and transitions to PAID.

**Errors:** `403` Not client | `409` Not SUBMITTED or escrow not ACTIVE

---

### POST /api/v1/projects/{projectId}/milestones/{milestoneId}/request-refund
**Description:** Client requests refund. Returns unsigned Soroban refund transaction XDR.  
**Auth:** Yes | **Roles:** COMPANY (client only)

**Request:** `{ "reason": "Scope changed. Mutually agreed to cancel." }`  
**Business Rules:** Milestone must be FUNDED or IN_PROGRESS  
**Response 200:**
```json
{
  "milestoneId": "01923mno-...",
  "action": "REFUND",
  "unsignedTransactionXdr": "AAAA...base64-xdr...",
  "contractAddress": "CABC...123",
  "amountXlm": "100.0000000",
  "instructions": "Sign this XDR with your wallet to initiate the refund."
}
```

---

## Domain 6: Escrow Tracking

### GET /api/v1/projects/{projectId}/milestones/{milestoneId}/escrow
**Description:** Full escrow contract status for a milestone.  
**Auth:** Yes | **Access:** Project participants

**Response 200:**
```json
{
  "id": "01923pqr-...",
  "milestoneId": "01923mno-...",
  "contractAddress": "CABC...123",
  "escrowStatus": "ACTIVE",
  "lockedAmountXlm": "100.0000000",
  "assetCode": "XLM",
  "clientWalletAddress": "GCLIENT...XYZ",
  "freelancerWalletAddress": "GFREE...XYZ",
  "arbitratorWalletAddress": null,
  "fundedAt": "2026-07-12T06:00:00Z",
  "releasedAt": null,
  "refundedAt": null,
  "createdAt": "...", "updatedAt": "..."
}
```

**Errors:** `404` No escrow contract yet (not funded)

---

### POST /api/v1/projects/{projectId}/milestones/{milestoneId}/escrow/prepare
**Description:** Prepare unsigned fund-escrow transaction for client wallet to sign.  
**Auth:** Yes | **Roles:** COMPANY (client only) | **Idempotency-Key:** Supported

**Business Rules:** Milestone must be DRAFT. User must have a verified primary wallet.  
**Response 200:**
```json
{
  "milestoneId": "01923mno-...",
  "action": "ESCROW_FUND",
  "unsignedTransactionXdr": "AAAA...base64-xdr...",
  "contractAddress": "CABC...123",
  "amountXlm": "100.0000000",
  "assetCode": "XLM",
  "clientWalletAddress": "GCLIENT...XYZ",
  "freelancerWalletAddress": "GFREE...XYZ",
  "instructions": "Sign this XDR with your wallet to lock funds into escrow."
}
```

**Errors:** `403` Not client or no verified wallet | `409` Not DRAFT or already has escrow

---

## Domain 7: Transaction History

### GET /api/v1/transactions
**Description:** List all blockchain transactions associated with the authenticated user's projects.  
**Auth:** Yes

**Query Params:** `txType` (ESCROW_FUND|PAYMENT_RELEASE|REFUND|CONTRACT_DEPLOY), `projectId`, `milestoneId`, `dateFrom`, `dateTo`, `page`, `pageSize`, `sortBy` (confirmedAt default), `sortDir` (desc default)

**Response 200:**
```json
{
  "data": [
    {
      "id": "01923vwx-...",
      "txHash": "a1b2c3d4e5f6...",
      "txType": "PAYMENT_RELEASE",
      "network": "TESTNET",
      "amountXlm": "100.0000000",
      "assetCode": "XLM",
      "networkFeeXlm": "0.0000100",
      "ledgerSequence": 12345678,
      "initiatedByWallet": "GCLIENT...XYZ",
      "milestone": { "id": "...", "title": "Wireframes & Design System" },
      "project": { "id": "...", "title": "DeFi Dashboard Redesign" },
      "confirmedAt": "2026-07-20T15:00:00Z",
      "createdAt": "2026-07-20T15:00:01Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 8, "totalPages": 1, "hasNextPage": false, "hasPreviousPage": false }
}
```

---

### GET /api/v1/transactions/{txHash}
**Description:** Get a single blockchain transaction by Stellar tx hash.  
**Auth:** Yes

**Response 200:** Full transaction object as above  
**Errors:** `403` Not associated with user's projects | `404` Not found

---

## Domain 8: Comments

### GET /api/v1/projects/{projectId}/comments
**Description:** List project-level comments.  
**Auth:** Yes | **Access:** Project participants

**Query Params:** `page`, `pageSize`, `sortDir` (asc default)  
**Response 200:** Paginated comments with author summary

---

### POST /api/v1/projects/{projectId}/comments
**Description:** Post a comment on a project.  
**Auth:** Yes | **Access:** Project participants

**Request:** `{ "content": "Can we extend the deadline by one week?" }`  
**Validation:** content 1–5000 chars. HTML stripped server-side.  
**Response 201:** Full comment object

---

### GET /api/v1/projects/{projectId}/milestones/{milestoneId}/comments
**Description:** List milestone-level comments.  
**Auth:** Yes | **Access:** Project participants  
**Response 200:** Paginated comment list

---

### POST /api/v1/projects/{projectId}/milestones/{milestoneId}/comments
**Description:** Post a comment on a specific milestone.  
**Auth:** Yes | **Access:** Project participants  
**Request:** `{ "content": "The Figma link is not accessible. Can you reshare?" }`  
**Response 201:** Full comment object

---

### DELETE /api/v1/comments/{commentId}
**Description:** Soft-delete a comment. Content replaced with `[deleted]`.  
**Auth:** Yes | **Access:** Comment author only  
**Response:** `204 No Content`  
**Errors:** `403` Not author

---

## Domain 9: Notifications

### GET /api/v1/notifications
**Description:** List all notifications for authenticated user, newest first.  
**Auth:** Yes

**Query Params:** `isRead` (boolean), `type`, `page` (default 1), `pageSize` (default 20, max 50)

**Response 200:**
```json
{
  "data": [
    {
      "id": "01923ab2-...",
      "notificationType": "MILESTONE_FUNDED",
      "title": "Escrow funded for Wireframes",
      "body": "Stellar Ventures locked 100 XLM into escrow for 'Wireframes & Design System'.",
      "actionUrl": "/projects/01923ghi-.../milestones/01923mno-...",
      "isRead": false,
      "createdAt": "2026-07-12T06:05:00Z"
    }
  ],
  "unreadCount": 3,
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 12, "totalPages": 1, "hasNextPage": false, "hasPreviousPage": false }
}
```

---

### PATCH /api/v1/notifications/{notificationId}/read
**Description:** Mark one notification as read.  
**Auth:** Yes  
**Response 200:** `{ "id": "...", "isRead": true, "readAt": "..." }`

---

### POST /api/v1/notifications/read-all
**Description:** Mark all unread notifications as read.  
**Auth:** Yes  
**Response 200:** `{ "markedRead": 3 }`

---

## Domain 10: Activity Timeline

### GET /api/v1/activity
**Description:** Global activity feed for authenticated user across all their projects.  
**Auth:** Yes

**Query Params:** `projectId`, `milestoneId`, `eventType`, `dateFrom`, `dateTo`, `page` (default 1), `pageSize` (default 30, max 100)

**Response 200:**
```json
{
  "data": [
    {
      "id": "01923cd3-...",
      "eventType": "MILESTONE_FUNDED",
      "summary": "Stellar Ventures funded escrow for 'Wireframes & Design System' (100 XLM).",
      "actor": { "id": "...", "displayName": "Stellar Ventures", "avatarUrl": "..." },
      "project": { "id": "...", "title": "DeFi Dashboard Redesign" },
      "milestone": { "id": "...", "title": "Wireframes & Design System" },
      "metadata": { "amountXlm": "100.0000000", "txHash": "a1b2c3..." },
      "occurredAt": "2026-07-12T06:05:00Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 30, "totalItems": 47, "totalPages": 2, "hasNextPage": true, "hasPreviousPage": false }
}
```

---

### GET /api/v1/projects/{projectId}/activity
**Description:** Activity timeline scoped to a single project.  
**Auth:** Yes | **Access:** Project participants  
**Response 200:** Same shape as `/activity`, filtered to the project

---

## Domain 11: Analytics Dashboard

### GET /api/v1/analytics/me
**Description:** Pre-computed metrics for authenticated user's dashboard.  
**Auth:** Yes | **Roles:** All

**Query Params:** `dateFrom` (default 30 days ago), `dateTo` (default today)

**Response 200 (FREELANCER):**
```json
{
  "userId": "01923abc-...", "accountType": "FREELANCER",
  "period": { "from": "2026-06-12", "to": "2026-07-12" },
  "summary": {
    "totalEarnedXlm": "850.0000000",
    "milestonesCompleted": 5, "milestonesInProgress": 2,
    "activeProjects": 3, "avgCompletionDays": 8.4
  },
  "earningsTrend": [
    { "date": "2026-07-01", "amountXlm": "100.0000000" },
    { "date": "2026-07-08", "amountXlm": "200.0000000" }
  ]
}
```

**Response 200 (COMPANY):**
```json
{
  "userId": "01923jkl-...", "accountType": "COMPANY",
  "period": { "from": "2026-06-12", "to": "2026-07-12" },
  "summary": {
    "totalPaidXlm": "500.0000000", "totalLockedInEscrowXlm": "200.0000000",
    "milestonesCompleted": 4, "activeProjects": 2, "projectsCompleted": 1
  },
  "spendingTrend": [
    { "date": "2026-07-01", "amountXlm": "100.0000000" }
  ]
}
```

---

### GET /api/v1/analytics/platform
**Description:** Platform-wide daily snapshots. Admin only.  
**Auth:** Yes | **Roles:** ADMIN

**Query Params:** `dateFrom`, `dateTo`

**Response 200:**
```json
{
  "period": { "from": "2026-06-12", "to": "2026-07-12" },
  "totals": { "activeUsers": 1240, "newRegistrations": 87, "projectsCreated": 34, "milestonesCompleted": 112, "totalVolumeXlm": "45230.0000000" },
  "dailySnapshots": [
    { "date": "2026-07-12", "activeUsers": 145, "newRegistrations": 12, "projectsCreated": 5, "milestonesCompleted": 18, "totalVolumeXlm": "3400.0000000" }
  ]
}
```

---

## Domain 12: Real-Time Events (SSE)

### GET /api/v1/events/stream
**Description:** Server-Sent Events stream for real-time updates scoped to authenticated user.  
**Auth:** Yes | **Protocol:** `text/event-stream`

**Event Types:**
```
event: MILESTONE_STATUS_CHANGED
data: {"milestoneId":"...","status":"FUNDED","projectId":"..."}

event: NOTIFICATION_RECEIVED
data: {"notificationId":"...","title":"...","type":"MILESTONE_FUNDED"}

event: ESCROW_STATUS_CHANGED
data: {"escrowId":"...","escrowStatus":"RELEASED","milestoneId":"..."}
```

---

## Domain 13: Admin (Internal — Not in Public OpenAPI)

### GET /api/v1/admin/users
**Auth:** Yes | **Roles:** ADMIN  
**Query Params:** `search`, `accountType`, `isActive`, `isEmailVerified`, `page`, `pageSize`, `sortBy`, `sortDir`  
**Response 200:** Paginated full user objects

### PATCH /api/v1/admin/users/{userId}/deactivate
**Auth:** Yes | **Roles:** ADMIN  
**Response 200:** `{ "id": "...", "isActive": false, "updatedAt": "..." }`

### GET /api/v1/admin/projects
**Auth:** Yes | **Roles:** ADMIN  
**Query Params:** `status`, `clientId`, `assigneeId`, `page`, `pageSize`  
**Response 200:** Paginated project list

### GET /api/v1/admin/transactions
**Auth:** Yes | **Roles:** ADMIN  
**Response 200:** Full platform transaction ledger (paginated, no ownership filter)

---

## Part 3 — Cross-Cutting Rules

### 3.1 OpenAPI Structure

Available at:
- Dev/Staging: `GET /swagger-ui.html` and `GET /v3/api-docs`
- Production: Internal network only

**Tags:** Authentication | Users | Wallets | Projects | Milestones | Escrow | Transactions | Comments | Notifications | Activity | Analytics | Admin

### 3.2 Async Escrow Action Pattern

```
1. Client calls prepare/approve/request-refund endpoint → receives unsigned XDR
2. Client signs XDR with wallet → submits directly to Stellar network
3. Ingestion daemon detects on-chain confirmation event
4. Backend updates milestone + escrow status in DB
5. SSE stream pushes MILESTONE_STATUS_CHANGED event to connected clients
6. Notification record created for both parties
```

Polling is not required. Clients subscribe to `GET /api/v1/events/stream`.

### 3.3 Field Ownership Model

| Field Class | Owner | Example |
|---|---|---|
| Application state | PostgreSQL / Spring Boot | status, title, createdAt |
| On-chain mirror | Ingestion Daemon (read-only to API) | contractAddress, txHash, ledgerSequence |
| Unsigned transactions | Spring Boot (built, not stored) | unsignedTransactionXdr |
| Signed transactions | Client wallet (never sent to server) | — submitted directly to Stellar |

### 3.4 Future API Expansion (Level 5+)

| Feature | Extension Point |
|---|---|
| Disputes | `POST /milestones/{id}/raise-dispute` |
| AI Assistant | `POST /ai/suggest-milestones`, `POST /ai/review-deliverable` |
| Reputation | `GET /users/{id}/reputation` + new field on user profile |
| Payroll | `POST /payroll-schedules` new context |
| GitHub Integration | `POST /projects/{id}/integrations/github` |
| Agency Accounts | `POST /agencies`, `GET /agencies/{id}/members` |
| Mobile Push | `POST /devices` for push token registration |
| Webhooks | `POST /webhooks`, `GET /webhooks` |
| Platform Fees | `feeXlm` added to transaction response (additive) |
| Mainnet | `network` config-driven — no endpoint changes |

---

## Endpoint Index

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| POST | /auth/register | No | — |
| POST | /auth/login | No | — |
| POST | /auth/refresh | No | — |
| POST | /auth/logout | Yes | All |
| POST | /auth/verify-email | No | — |
| POST | /auth/forgot-password | No | — |
| POST | /auth/reset-password | No | — |
| GET | /auth/me | Yes | All |
| PATCH | /users/me | Yes | COMPANY, FREELANCER |
| DELETE | /users/me | Yes | COMPANY, FREELANCER |
| GET | /users/{userId}/profile | Yes | All |
| GET | /wallets/challenge | Yes | All |
| GET | /wallets | Yes | All |
| POST | /wallets | Yes | All |
| PATCH | /wallets/{walletId}/set-primary | Yes | All |
| DELETE | /wallets/{walletId} | Yes | All |
| GET | /projects | Yes | COMPANY, FREELANCER |
| POST | /projects | Yes | COMPANY |
| GET | /projects/{id} | Yes | Participants |
| PATCH | /projects/{id} | Yes | COMPANY (client) |
| POST | /projects/{id}/cancel | Yes | COMPANY (client) |
| GET | /projects/{id}/milestones | Yes | Participants |
| POST | /projects/{id}/milestones | Yes | COMPANY (client) |
| GET | /projects/{id}/milestones/{mid} | Yes | Participants |
| PATCH | /projects/{id}/milestones/{mid} | Yes | COMPANY (client) |
| DELETE | /projects/{id}/milestones/{mid} | Yes | COMPANY (client) |
| POST | /projects/{id}/milestones/{mid}/start | Yes | FREELANCER (assignee) |
| POST | /projects/{id}/milestones/{mid}/submit | Yes | FREELANCER (assignee) |
| POST | /projects/{id}/milestones/{mid}/approve | Yes | COMPANY (client) |
| POST | /projects/{id}/milestones/{mid}/request-refund | Yes | COMPANY (client) |
| GET | /projects/{id}/milestones/{mid}/escrow | Yes | Participants |
| POST | /projects/{id}/milestones/{mid}/escrow/prepare | Yes | COMPANY (client) |
| GET | /transactions | Yes | All |
| GET | /transactions/{txHash} | Yes | All |
| GET | /projects/{id}/comments | Yes | Participants |
| POST | /projects/{id}/comments | Yes | Participants |
| GET | /projects/{id}/milestones/{mid}/comments | Yes | Participants |
| POST | /projects/{id}/milestones/{mid}/comments | Yes | Participants |
| DELETE | /comments/{commentId} | Yes | Author only |
| GET | /notifications | Yes | All |
| PATCH | /notifications/{id}/read | Yes | All |
| POST | /notifications/read-all | Yes | All |
| GET | /activity | Yes | All |
| GET | /projects/{id}/activity | Yes | Participants |
| GET | /analytics/me | Yes | All |
| GET | /analytics/platform | Yes | ADMIN |
| GET | /events/stream | Yes | All |
| GET | /admin/users | Yes | ADMIN |
| PATCH | /admin/users/{id}/deactivate | Yes | ADMIN |
| GET | /admin/projects | Yes | ADMIN |
| GET | /admin/transactions | Yes | ADMIN |
