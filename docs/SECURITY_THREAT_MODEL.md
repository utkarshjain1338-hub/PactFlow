# PactFlow — Security Threat Model

> **Document Type:** Security Threat Model & Risk Register  
> **Authority:** PROJECT_CONSTITUTION.md · DOMAIN_MODEL.md · API_SPECIFICATION.md · SMART_CONTRACT_SPEC.md · SYSTEM_ARCHITECTURE.md  
> **Classification:** Internal — Engineering & Security Team  
> **Version:** 1.0  
> **Status:** Approved — Baseline Security Reference  
> **Last Updated:** 2026-07-12  
> **Review Cadence:** Quarterly and after every significant architectural change  

---

## ⚠️ Constitutional Security Mandate

> *"Security Precedes Features. We never sacrifice security for velocity. Escrow safety, input validation, wallet signature verification, and private key safety are prioritized above any product feature."*
> — PROJECT_CONSTITUTION.md, Rule 5

This document operationalizes that mandate by cataloguing every identified threat, assigning risk ratings, and documenting specific mitigations for the PactFlow platform.

---

## Table of Contents

1. [Asset Register](#1-asset-register)
2. [Trust Boundaries](#2-trust-boundaries)
3. [STRIDE Threat Analysis](#3-stride-threat-analysis)
4. [Authentication Threats](#4-authentication-threats)
5. [Authorization Threats](#5-authorization-threats)
6. [Wallet Security](#6-wallet-security)
7. [Smart Contract Threats](#7-smart-contract-threats)
8. [Backend Threats](#8-backend-threats)
9. [Frontend Threats](#9-frontend-threats)
10. [Database Threats](#10-database-threats)
11. [Infrastructure Threats](#11-infrastructure-threats)
12. [API Abuse](#12-api-abuse)
13. [Rate Limiting](#13-rate-limiting)
14. [Secrets Management](#14-secrets-management)
15. [Logging & Auditing](#15-logging--auditing)
16. [Incident Response](#16-incident-response)
17. [Disaster Recovery](#17-disaster-recovery)
18. [Security Testing Strategy](#18-security-testing-strategy)
19. [Security Checklist](#19-security-checklist)
20. [Future Security Roadmap](#20-future-security-roadmap)

---

## Risk Rating System

All threats are rated on a consistent 4-value matrix:

| Dimension | Values |
|---|---|
| **Likelihood** | `Critical` · `High` · `Medium` · `Low` · `Very Low` |
| **Impact** | `Critical` · `High` · `Medium` · `Low` |
| **Risk Score** | `Critical` (Lkh×Imp both ≥ High) · `High` · `Medium` · `Low` |

> **Risk Score Rule:** A threat is `Critical` if both Likelihood ≥ High AND Impact = Critical. A single `Critical` finding blocks the release until mitigated.

---

## 1. Asset Register

Assets are the resources that must be protected. Every threat in this model targets one or more assets.

### 1.1 Financial Assets

| Asset | Description | Value | Owner |
|---|---|---|---|
| **Escrowed XLM/Tokens** | Funds locked in Soroban contracts on behalf of clients | Direct financial value — all client escrow balances | Soroban Contract |
| **Client Wallet Balances** | XLM held in client Stellar wallets for future escrow funding | Indirect — future platform revenue | Client User |
| **Freelancer Wallet Balances** | XLM released to freelancers upon milestone approval | Indirect — freelancer livelihoods | Freelancer User |

### 1.2 Cryptographic Assets

| Asset | Description | Sensitivity | Storage |
|---|---|---|---|
| **JWT Secret Key** | HMAC key signing all access tokens | **CRITICAL** — compromise = account takeover for all users | Railway Secret Variables only |
| **Admin Stellar Private Key** | Signs contract pause/upgrade operations | **CRITICAL** — compromise = contract manipulation | Multi-sig hardware wallet only |
| **User Stellar Private Keys** | Authorize fund releases and refunds | **CRITICAL** — compromise = fund theft | User's wallet extension (never server-side) |
| **Wallet Challenge Nonces** | One-time values for wallet ownership proofs | **HIGH** — reuse enables wallet spoofing | Redis (5-minute TTL only) |
| **Refresh Token Values** | Long-lived session continuity tokens | **HIGH** — theft enables persistent session hijack | httpOnly cookie (client) + SHA-256 hash (DB) |

### 1.3 Personally Identifiable Information (PII)

| Asset | Description | Regulatory Concern | Storage |
|---|---|---|---|
| **Email Addresses** | User login credentials and communication channel | GDPR, CCPA | PostgreSQL (encrypted at rest) |
| **Password Hashes** | Argon2id-derived credential hashes | Security-critical | PostgreSQL |
| **Display Names** | Publicly visible identity | GDPR | PostgreSQL |
| **IP Addresses** | Authentication event logs | GDPR (pseudonymised) | Audit logs (hashed) |
| **User Agent Strings** | Device fingerprint in auth logs | GDPR | Audit logs |
| **Avatar URLs** | Profile image references | Low sensitivity | PostgreSQL + CDN |

### 1.4 Business Logic Assets

| Asset | Description | Impact of Compromise |
|---|---|---|
| **Milestone State** | The current status of each milestone (DRAFT → PAID) | Incorrect status = incorrect payments or fake completions |
| **Escrow Contract Records** | Off-chain mirror of on-chain escrow state | Desync = UI shows wrong status; no fund movement impact |
| **Blockchain Transaction Log** | Immutable audit of on-chain events | Manipulation = fraudulent payment records |
| **Activity Events** | Full audit trail of platform actions | Deletion = inability to resolve disputes |
| **Deliverable Records** | URLs and metadata of submitted work | Deletion = no evidence of completed work |

### 1.5 Infrastructure Assets

| Asset | Description | Impact of Compromise |
|---|---|---|
| **PostgreSQL Database** | All application state | Total platform compromise |
| **Redis Instance** | Sessions, nonces, rate limit counters | Session hijack, wallet spoofing, rate limit bypass |
| **Railway Environment Variables** | Runtime secrets and config | Platform compromise |
| **GitHub Repository** | Source code and CI/CD pipelines | Supply chain attack vector |
| **Soroban Contract Address** | On-chain contract location | Phishing target (fake contract) |
| **Horizon/RPC Endpoint** | Blockchain communication channel | Ingestion daemon desync |

---

## 2. Trust Boundaries

Trust boundaries define where data or control crosses from a lower-trust to higher-trust context. All boundaries must be explicitly validated.

### 2.1 Trust Boundary Map

```
┌─────────────────────────────────────────────────────────────────────┐
│  ZONE 0 — UNTRUSTED (Internet)                                      │
│  • Browsers (anonymous users)                                       │
│  • Bot traffic                                                      │
│  • Automated scanners                                               │
│  • Malicious actors                                                 │
│                                                                     │
│  ═══════════════ BOUNDARY 1: Cloudflare WAF + DDoS ═══════════════  │
│                                                                     │
│  ZONE 1 — EDGE / DMZ                                                │
│  • Cloudflare CDN (static assets)                                   │
│  • Vercel Edge Functions (Next.js server)                           │
│  • Railway Load Balancer (TLS termination)                          │
│                                                                     │
│  ═══════════════ BOUNDARY 2: TLS + JWT Auth ═══════════════════════  │
│                                                                     │
│  ZONE 2 — APPLICATION                                               │
│  • Spring Boot API (authenticated requests)                         │
│  • Ingestion Daemon (internal — no public port)                     │
│                                                                     │
│  ═══════════════ BOUNDARY 3: DB Roles + Network ACL ═══════════════  │
│                                                                     │
│  ZONE 3 — DATA                                                      │
│  • PostgreSQL (Role: pactflow_app)                                  │
│  • Redis (AUTH required)                                            │
│                                                                     │
│  ═══════════════ BOUNDARY 4: DB Role Separation ═══════════════════  │
│                                                                     │
│  ZONE 4 — PRIVILEGED DATA (Escrow Tables)                           │
│  • escrow_contracts (Role: pactflow_ingestion only)                 │
│  • blockchain_transactions (Role: pactflow_ingestion only)          │
│                                                                     │
│  ═══════════════ BOUNDARY 5: Stellar Network (Trustless) ══════════  │
│                                                                     │
│  ZONE 5 — BLOCKCHAIN                                                │
│  • Soroban Smart Contract (self-executing, tamper-proof)            │
│  • Stellar Ledger (globally distributed, append-only)               │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Boundary Crossing Requirements

| Crossing | From | To | Validation Required |
|---|---|---|---|
| B1 | Internet | Edge | Cloudflare: IP reputation, rate limit, WAF rules |
| B2 | Edge | Application | TLS 1.3, JWT signature + expiry + Redis session |
| B3 | Application | Database | HikariCP credentials, network ACL, DB role |
| B4 | App DB writes | Escrow tables | Rejected — `pactflow_app` role has no WRITE on these tables |
| B4 | Daemon → Escrow | Escrow tables | `pactflow_ingestion` role; no read of user tables |
| B5 | Application | Blockchain | Horizon HTTPS; XDR verified by Stellar consensus |
| B5 | Blockchain | Application | Daemon: event filtering by `pactflow` topic prefix |

### 2.3 External Trust Relationships

| External Party | Trust Level | Risk | Control |
|---|---|---|---|
| Stellar Network (Horizon) | **High** — public blockchain | RPC availability | Retry + fallback RPC |
| Soroban Contract | **Full** — our code, on-chain | Contract bug | Audit + pause function |
| Vercel | **High** — infrastructure provider | Supply chain, misconfiguration | SLA, security headers, WAF |
| Railway | **High** — infrastructure provider | Secret exposure, outage | Secret rotation, backups |
| Wallet Extension (Freighter) | **Medium** — user-controlled | Malicious extension | Ed25519 verification |
| User's Browser | **Untrusted** | XSS, client manipulation | Never trust client data |
| Email Provider (SendGrid) | **Medium** | Email spoofing | SPF, DKIM, DMARC |

---

## 3. STRIDE Threat Analysis

STRIDE is the primary threat modelling framework. Each letter represents a threat category applied across PactFlow's full attack surface.

### S — Spoofing (Identity Impersonation)

| ID | Threat | Target Asset | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| S-01 | Attacker submits forged JWT to impersonate another user | API endpoints | Low | Critical | High | JWT signed with server-only secret; `sub` re-validated against DB on sensitive ops |
| S-02 | Attacker supplies a Stellar public key they don't own to link a wallet | Wallet linking | Medium | High | High | Ed25519 nonce challenge: must sign with private key to prove ownership |
| S-03 | Attacker replays a captured wallet challenge response | Wallet linking | Medium | High | High | Nonce is single-use; deleted from Redis on first use; 5-minute TTL |
| S-04 | Phishing site mimics PactFlow to steal credentials | User credentials | Medium | High | High | HSTS, SPF/DKIM/DMARC; user education; email-based verification |
| S-05 | Fake Soroban contract address published to phish users | On-chain funds | Low | Critical | High | Contract address published in official docs + UI; HTTPS-only communication |
| S-06 | Attacker spoofs ingestion daemon to write fake escrow records | Escrow tables | Low | Critical | High | DB role separation: only `pactflow_ingestion` role can write escrow tables |

---

### T — Tampering (Data Integrity Attacks)

| ID | Threat | Target Asset | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| T-01 | SQL injection via API inputs modifies DB records | All DB tables | Low | Critical | High | JPA parameterised queries; no dynamic SQL; Checkmarx SAST |
| T-02 | Attacker modifies unsigned XDR in transit before wallet signing | Escrow transactions | Low | Critical | High | HTTPS TLS 1.3 in transit; XDR hash displayed in wallet extension for review |
| T-03 | Man-in-the-middle modifies API response to show fake payment status | Milestone status | Very Low | High | Medium | HTTPS + HSTS; SRI on JS; CORS strict policy |
| T-04 | Attacker tampers with `platform_reference_id` in contract call | Escrow correlation | Low | High | Medium | Reference is a 32-byte hash; contract validates length and non-zero; off-chain verified by daemon |
| T-05 | Flyway migration script tampered in CI/CD pipeline | Database schema | Very Low | Critical | High | Code signing; protected `main` branch; 2 reviewers required for schema changes |
| T-06 | Attacker modifies outbox_events to trigger fraudulent notifications | Notifications | Low | Medium | Low | Outbox events only read + processed by daemon; no external write path |
| T-07 | Malicious JS injection modifies deliverable URLs before submission | Deliverables | Medium | High | High | Server-side URL sanitisation; allowlist `https://` scheme; display in sandbox iframe |

---

### R — Repudiation (Denial of Actions)

| ID | Threat | Target Asset | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| R-01 | Client denies approving a milestone payment | Audit trail | Medium | High | High | Immutable `blockchain_transactions` row; on-chain `MilestoneReleased` event; both irrefutable |
| R-02 | Freelancer denies submitting deliverables | Dispute evidence | Medium | High | High | `deliverables` table with `submitted_at` timestamp; activity event log |
| R-03 | Admin denies deactivating a user account | Audit trail | Low | Medium | Low | All admin actions write to `audit_log` with actor, timestamp, IP, action |
| R-04 | Attacker deletes log records to hide activity | Security audit | Low | High | Medium | Append-only audit log; log shipping to immutable external store (Sentry, S3) |
| R-05 | Replay of old signed XDR to re-execute a contract call | On-chain funds | Very Low | Critical | Medium | Stellar transaction sequence numbers; terminal escrow state rejects replays |

---

### I — Information Disclosure (Data Leakage)

| ID | Threat | Target Asset | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| I-01 | API error reveals stack traces, DB schema, or internal paths | System internals | Medium | Medium | Medium | `GlobalExceptionHandler` sanitises all 5xx responses; no stack traces in prod |
| I-02 | JWT payload decoded exposes sensitive user data | User PII | Medium | Medium | Medium | JWT contains only `sub`, `email`, `accountType`, `sessionId` — no PII |
| I-03 | DB query error message leaks table names or column structures | DB schema | Low | Medium | Low | All JDBC exceptions wrapped before returning; generic 500 response |
| I-04 | User enumeration via different responses to login vs. register | Email addresses | High | Medium | Medium | Identical 401 response for wrong email and wrong password; 202 for forgot-password |
| I-05 | Attacker reads another user's project via IDOR | Project data | Medium | High | High | Service layer verifies `requestingUserId` is client or assignee on every resource read |
| I-06 | Log files contain raw PII (email, IP) | User PII | Medium | Medium | Medium | Logs contain `userId` (UUID), never raw email; IPs hashed in logs |
| I-07 | Redis session cache accessible without auth | Session tokens | Very Low | Critical | High | Redis configured with `requirepass`; accessible only within Railway private network |
| I-08 | Leaked environment variable in build logs | JWT secret, DB password | Low | Critical | High | Railway secret variables never printed; CI logs masked; `.env` git-ignored |
| I-09 | Browser DevTools reveal sensitive API response fields | Financial data | Low | Medium | Low | Wallet private keys never transmitted to or from server; amounts are public |
| I-10 | Soroban event reveals PII from `platform_reference_id` | User PII | Very Low | High | Medium | `platform_reference_id` is one-way hash of milestone UUID — no PII recoverable |

---

### D — Denial of Service (Availability Attacks)

| ID | Threat | Target Asset | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| D-01 | Volumetric DDoS floods API endpoints | API availability | Medium | High | High | Cloudflare Layer 3/4 DDoS mitigation; Railway auto-scaling |
| D-02 | Application-layer DDoS (HTTP flood) targets expensive endpoints | API performance | Medium | High | High | Cloudflare WAF + rate limiting; Bucket4j per-IP limits |
| D-03 | Attacker creates thousands of escrow records to bloat DB | DB storage | Low | Medium | Medium | `create_escrow` requires client JWT + verified wallet; one escrow per milestone enforced |
| D-04 | Ingestion daemon overwhelmed by forged Soroban events | Event processing | Low | Medium | Low | Event filter on `pactflow` topic prefix; contract address whitelist in daemon config |
| D-05 | Slow-loris attack keeps API threads occupied | API availability | Low | Medium | Medium | Spring Boot with Virtual Threads + request timeout (30s); Cloudflare timeout rules |
| D-06 | Contract pause abused by compromised admin key | Platform operations | Very Low | High | Medium | Admin key is multi-sig; pause event triggers immediate security alert |
| D-07 | Outbox processor stuck in retry loop exhausting DB connections | DB connections | Low | Medium | Medium | Max 5 retries then dead-letter; circuit breaker on outbox processor |

---

### E — Elevation of Privilege (Unauthorized Access Escalation)

| ID | Threat | Target Asset | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| E-01 | Freelancer escalates to approve their own milestone payment | Escrow funds | Medium | Critical | Critical | Contract requires `client` address auth; Spring Boot verifies `accountType == COMPANY` |
| E-02 | Company user acts as admin via manipulated JWT claim | Admin functions | Low | Critical | High | JWT `accountType` is routing hint only; server re-queries DB role on every privileged op |
| E-03 | JWT algorithm confusion attack (RS256 → HS256 downgrade) | Account takeover | Low | Critical | High | Backend explicitly enforces `HS256`; rejects tokens with unexpected `alg` header |
| E-04 | Admin account takeover via credential stuffing | Admin privileges | Medium | Critical | Critical | MFA required for admin accounts; admin credentials not reused |
| E-05 | Ingestion daemon gains write access to user tables | User data | Very Low | High | Medium | `pactflow_ingestion` role has WRITE ONLY to escrow + transaction tables |
| E-06 | Attacker exploits path traversal to read server files | Server internals | Low | High | Medium | Spring Boot doesn't serve static files from filesystem; no directory traversal surface |

---

## 4. Authentication Threats

### 4.1 Login & Session Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| AT-01 | **Credential Stuffing** — Attacker tries breached username/password pairs from other sites | High | High | High | Argon2id password hashing (not reversible); account lockout after 10 failures; breach detection via HaveIBeenPwned API (future) |
| AT-02 | **Brute Force Password Attack** | High | High | High | Rate limit: 10 login attempts per 1 min per IP; exponential backoff lockout; CAPTCHA on repeat failures |
| AT-03 | **JWT Token Theft via XSS** | Medium | Critical | Critical | Access token stored in memory only (never localStorage/sessionStorage); httpOnly cookies for refresh tokens |
| AT-04 | **Refresh Token Theft via Cookie Hijack** | Low | Critical | High | `SameSite=Strict`; `Secure` flag; `httpOnly`; short TLD-scoped path |
| AT-05 | **Refresh Token Replay after Logout** | Low | High | Medium | Logout invalidates SHA-256 hash in `user_sessions`; replayed token finds no matching hash → 401 |
| AT-06 | **Session Fixation** | Very Low | High | Medium | New session ID issued on every successful login; old session invalidated |
| AT-07 | **Expired Token Accepted** | Very Low | Critical | High | JWT `exp` claim enforced server-side; system clock synchronized; 60-second clock skew tolerance only |
| AT-08 | **Concurrent Session Abuse** | Low | Medium | Low | `sessionId` in JWT uniquely identifies the session; admin can terminate sessions (future) |
| AT-09 | **Email Verification Bypass** | Low | High | Medium | Email-sensitive operations (wallet link, escrow) require `is_email_verified = true`; verification token expires in 24h |
| AT-10 | **Account Enumeration via Timing** | High | Medium | Medium | Argon2id verification runs in constant time; even for non-existent user, a dummy hash is always compared |

### 4.2 Password Reset Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| AT-11 | **Password Reset Token Theft via Email Interception** | Low | Critical | High | Reset token is 256-bit random; link is HTTPS-only; token expires in 1 hour; single-use |
| AT-12 | **User Enumeration via Reset Response** | High | Medium | Medium | `POST /auth/forgot-password` always returns `202` regardless of whether email exists |
| AT-13 | **Parallel Reset Token Attacks** | Low | Medium | Low | Only the latest reset token is valid; issuing a new one invalidates the previous |
| AT-14 | **Reset Flow CSRF** | Low | High | Medium | Reset token in URL body (not cookie); SameSite cookies prevent CSRF on the POST submission |

---

## 5. Authorization Threats

### 5.1 Role-Based Access Control Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| AZ-01 | **Horizontal Privilege Escalation (IDOR)** — User reads another user's project | Medium | High | High | Every resource read verifies `userId == client_id OR userId == assignee_id`; JWT `sub` never trusted alone |
| AZ-02 | **Vertical Privilege Escalation** — Freelancer calls company-only endpoint | Medium | High | High | `@PreAuthorize("hasRole('COMPANY')")` on all company-restricted methods; role from DB, not JWT |
| AZ-03 | **JWT Claim Manipulation** — Attacker edits `accountType` in JWT payload | Low | Critical | High | JWT is HMAC-signed; unsigned or tampered tokens fail signature validation immediately |
| AZ-04 | **Mass Assignment** — Attacker sends extra fields (e.g., `isAdmin: true`) in request body | Medium | High | High | All DTOs use explicit field allowlists; `@JsonIgnoreProperties(ignoreUnknown=true)` prevents unknown fields from mapping to domain |
| AZ-05 | **Forced Browse to Admin Panel** | Medium | High | High | Admin endpoints require `ROLE_ADMIN`; role verified server-side from DB, not token claim alone |
| AZ-06 | **Insecure Direct Object Reference on Wallet** | Medium | High | High | Wallet operations verify `wallet.userId == authenticatedUser.id` at service layer |
| AZ-07 | **Broken Function Level Access Control** | Low | High | Medium | All controller methods annotated with explicit role checks; OpenAPI security requirements auto-documented |
| AZ-08 | **Admin Account Abuse** | Low | Critical | High | Admin role cannot trigger contract functions; admin capabilities limited to: view all resources, deactivate users, read audit logs |

### 5.2 Contract-Level Authorization Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| AZ-09 | **Freelancer calls `release_payment`** | Medium | Critical | Critical | `require_auth(client)` in contract; Soroban runtime verifies Ed25519 signature; non-client call unconditionally rejected |
| AZ-10 | **Admin calls `release_payment`** | Low | Critical | High | Admin address not stored in contract's payment functions; `pause`/`unpause` are the only admin contract powers |
| AZ-11 | **Third party calls `expire()` to trigger early refund** | Low | Low | Low | `expire()` requires `current_ledger >= expiration_ledger`; cannot be triggered early regardless of caller |
| AZ-12 | **Attacker creates escrow with someone else as client** | Medium | High | High | `create_escrow` requires `require_auth(client_parameter)`; only the actual client can create their own escrow |

---

## 6. Wallet Security

### 6.1 Wallet Connection Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| WS-01 | **Private Key Extraction Attempt** | Low | Critical | High | Server never requests, stores, or transmits private keys; wallet extension sandboxes key operations |
| WS-02 | **Nonce Reuse Attack** — Attacker reuses captured signed nonce | Medium | High | High | Nonce is deleted from Redis on first successful use; any second submission finds no nonce → 400 |
| WS-03 | **Nonce Flooding** — Attacker generates thousands of nonces for an address | High | Medium | Medium | Rate limit: 5 challenge requests per IP per minute; Redis TTL auto-expires unused nonces |
| WS-04 | **Wallet Challenge Timing Attack** | Low | Medium | Low | 5-minute TTL is fixed; constant-time comparison of nonce strings |
| WS-05 | **Malicious Wallet Extension** | Low | Critical | High | PactFlow recommends official extensions; WalletKit validates wallet type at integration; Ed25519 verification ensures signature is valid for stated key |
| WS-06 | **Wallet Address Linking to Multiple Accounts** | Low | High | High | Unique constraint on `stellar_public_key` in `wallet_connections`; duplicate checked before insert |
| WS-07 | **Wallet Address Spoofing in API Request** | Medium | High | High | All wallet-related API calls require JWT auth; wallet address bound to `userId` in DB; cannot specify another user's wallet |
| WS-08 | **XDR Transaction Blind Signing** | Medium | Critical | High | WalletKit displays decoded transaction summary in wallet extension; users review before signing; backend returns plain-language `instructions` field alongside XDR |
| WS-09 | **Wallet Key Compromise (User-Side)** | Low | Critical | High | Contract limits damage: only the specific escrow's funds are at risk; unlink compromised wallet endpoint available immediately |
| WS-10 | **Multi-Wallet Race Condition** | Low | Medium | Low | Primary wallet set atomically via DB transaction; `SET PRIMARY` demotes old primary in same transaction |

### 6.2 Transaction Signing Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| WS-11 | **XDR Substitution Attack** — Frontend replaces valid XDR with malicious one | Low | Critical | High | HTTPS TLS prevents in-transit substitution; XDR decoded and displayed by wallet extension |
| WS-12 | **Signature Forgery** | Very Low | Critical | High | Ed25519 is computationally infeasible to forge; Stellar validators verify; Soroban `require_auth()` enforces |
| WS-13 | **Signed Transaction Replay** | Very Low | Critical | Medium | Stellar account sequence number increments on each transaction; replayed TX has stale sequence → rejected by validators |
| WS-14 | **Unauthorized Contract Invocation** | Low | Critical | High | All state-changing contract functions use `require_auth()`; no anonymous function call permitted |

---

## 7. Smart Contract Threats

### 7.1 Contract Logic Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| SC-01 | **Unauthorized Fund Release** | Low | Critical | Critical | `release_payment` enforces `require_auth(client)`; no admin override path exists |
| SC-02 | **Double Release** — Same escrow released twice | Very Low | Critical | High | State machine: post-`Completed` status rejects all write operations with `InvalidState` |
| SC-03 | **Double Fund** — Same escrow funded twice | Very Low | High | Medium | `fund()` only valid from `Created` state; second call gets `InvalidState` |
| SC-04 | **State Machine Bypass** — Jump directly to `Completed` | Very Low | Critical | High | `EscrowStatus` is a typed enum; no generic state-setter; all writes go through validated transition functions |
| SC-05 | **Reentrancy Attack** | Very Low | Critical | Medium | Soroban execution model prevents EVM-style reentrancy; `ReentrancyGuard` temporary storage as defence-in-depth; checks-effects-interactions order |
| SC-06 | **Integer Overflow in Amount Arithmetic** | Very Low | High | Medium | Amounts stored as `i128`; explicit overflow checks; `ArithmeticOverflow` error variant |
| SC-07 | **Storage Key Collision** | Very Low | High | Medium | All keys are typed enums (`DataKey::Escrow(Bytes32)`); no raw string keys; compile-time safety |
| SC-08 | **Malicious Expiration Manipulation** | Low | High | Medium | `expiration_ledger` set at creation and immutable; `expire()` validates `current_ledger >= expiration_ledger`; cannot be triggered early |
| SC-09 | **Fund Theft via Admin Key** | Low | Critical | High | Admin key scope: `pause`/`unpause` only; zero access to fund transfer functions; architectural guarantee |
| SC-10 | **Contract Upgrade Attack** | Very Low | Critical | High | Upgrade requires multi-sig admin key; 48-hour time-lock planned (Level 5); wasm binary hash published before upgrade |
| SC-11 | **Fake Event Injection** | Very Low | Critical | High | Events only emitted within contract execution; cannot be forged externally; ingestion daemon validates `contractAddress` |
| SC-12 | **Storage Bloat via Spam Escrows** | Medium | Medium | Medium | `create_escrow` requires valid JWT + verified wallet; Soroban storage fees deter spam; escrow IDs must be unique |

### 7.2 Ingestion Daemon Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| SC-13 | **Event Processing Out of Order** | Low | High | High | Cursor-based sequential processing; events processed in ledger order; idempotency check on `tx_hash` |
| SC-14 | **Daemon Processes Fake Contract Events** | Low | Critical | High | Daemon whitelists `contractAddress`; `pactflow` topic prefix filter; event schema validated before processing |
| SC-15 | **Daemon Crash Causes Missed Events** | Medium | High | High | `last_processed_ledger` cursor in DB; restart resumes from last committed ledger; no events skipped |
| SC-16 | **Double Processing of Same Event** | Medium | High | High | Idempotency: `blockchain_transactions.tx_hash` has UNIQUE constraint; duplicate insert → ignore |
| SC-17 | **RPC Node Compromise** | Very Low | High | Medium | Verify event data against known contract address; validate `platform_reference_id` against DB; anomalous volumes trigger alert |

---

## 8. Backend Threats

### 8.1 Injection Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| BE-01 | **SQL Injection** | Low | Critical | High | Spring Data JPA / Hibernate parameterised queries exclusively; no string-concatenated SQL; SAST scan in CI |
| BE-02 | **JPQL Injection** | Low | High | High | Repository methods use Spring Data method names or `@Query` with named parameters only |
| BE-03 | **Log Injection (CRLF/Log Forging)** | Medium | Medium | Medium | SLF4J structured logging sanitises newline characters; JSON log format prevents CRLF injection |
| BE-04 | **Server-Side Request Forgery (SSRF)** | Low | High | Medium | Deliverable URLs validated against HTTPS-only allowlist; no server-side URL fetching for user content |
| BE-05 | **XML External Entity (XXE)** | Very Low | Medium | Low | API accepts only `application/json`; no XML parsers in request pipeline; `Content-Type` strictly enforced |
| BE-06 | **Expression Language Injection** | Low | High | Medium | User input never passed to SpEL evaluators; `@Value` annotations use only environment variables |

### 8.2 Deserialization & Library Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| BE-07 | **Insecure Deserialization** | Low | High | Medium | Jackson configured with `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES`; no polymorphic deserialization of user input |
| BE-08 | **Dependency Vulnerability (CVE)** | Medium | High | High | Dependabot alerts on every push; OWASP Dependency Check in CI pipeline; weekly automated PR for patches |
| BE-09 | **Transitive Dependency Attack** | Low | High | Medium | Dependency lockfile (`pom.xml` with checksums); Maven `enforcer` plugin validates no snapshot dependencies in production builds |

### 8.3 Business Logic Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| BE-10 | **Milestone Amount Exceeds Project Budget** | Medium | Medium | Medium | Application-layer check: sum of all milestone amounts ≤ `project.total_budget_xlm` enforced before INSERT |
| BE-11 | **Race Condition on Milestone Status** | Low | High | High | Optimistic locking (`@Version` on Milestone entity); conflict → 409, retry up to 3 times with backoff |
| BE-12 | **Client Assigns Themselves as Freelancer** | Medium | High | High | Validation: `project.client_id ≠ project.assignee_id`; enforced at API validation layer (422) and domain layer |
| BE-13 | **Escrow Prepared for Unfunded Milestone** | Low | High | Medium | `prepare_escrow` checks milestone status == DRAFT before building XDR; subsequent chain verification via daemon |

---

## 9. Frontend Threats

### 9.1 Client-Side Injection Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| FE-01 | **Cross-Site Scripting (XSS) — Stored** | Medium | Critical | High | All user content rendered via React's JSX (auto-escapes); comment/bio content sanitised server-side with DOMPurify allowlist |
| FE-02 | **Cross-Site Scripting (XSS) — Reflected** | Low | High | High | No `dangerouslySetInnerHTML` usage; URL parameters never rendered raw |
| FE-03 | **Cross-Site Scripting (XSS) — DOM-Based** | Low | High | High | CSP header blocks inline scripts; `nonce`-based script allowlisting |
| FE-04 | **Cross-Site Request Forgery (CSRF)** | Low | High | Medium | `SameSite=Strict` on refresh token cookie; API checks `Origin` header on all state-changing requests |
| FE-05 | **Clickjacking** | Low | Medium | Low | `X-Frame-Options: DENY`; `frame-ancestors 'none'` in CSP header |
| FE-06 | **Open Redirect** | Medium | Medium | Medium | Post-login redirect validates against allowlist of internal paths; no raw URL from query string |
| FE-07 | **Malicious Deliverable URL (JS scheme)** | Medium | High | High | All deliverable URLs validated: must start with `https://`; rendered in `<a target="_blank" rel="noopener noreferrer">` |

### 9.2 Client Security Headers

All responses from the Next.js server and the Spring Boot API must include:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforce HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Content-Security-Policy` | Strict nonce-based policy | Prevent XSS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disable unnecessary browser APIs |
| `Cross-Origin-Opener-Policy` | `same-origin` | Prevent cross-origin window access |
| `Cross-Origin-Resource-Policy` | `same-origin` | Prevent resource embedding |

### 9.3 Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'nonce-{server-generated}' https://cdn.vercel.com;
style-src 'self' 'nonce-{server-generated}' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https://cdn.pactflow.io https://avatars.githubusercontent.com;
connect-src 'self' https://api.pactflow.io https://horizon-testnet.stellar.org;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

### 9.4 Third-Party Script Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Malicious PostHog update injects keylogger | Very Low | Critical | Subresource Integrity (SRI) on all third-party scripts; pin PostHog SDK version |
| Sentry SDK exfiltrates user data | Very Low | High | CSP `connect-src` restricts Sentry to its official endpoint; Sentry configured to scrub PII fields |
| CDN compromise serves malicious JS | Very Low | Critical | SRI on all CDN-loaded assets; Cloudflare trusted CDN provider |

---

## 10. Database Threats

### 10.1 Access Control Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| DB-01 | **Exposed Database Port** | Low | Critical | High | PostgreSQL binds to private network only; no public endpoint in Railway configuration |
| DB-02 | **Weak Database Credentials** | Low | Critical | High | Credentials are Railway-generated 32+ character random strings; rotated quarterly |
| DB-03 | **Overprivileged Application Role** | Medium | High | High | `pactflow_app` cannot write to `escrow_contracts` or `blockchain_transactions`; schema enforced at DB level |
| DB-04 | **Database Backup Exposure** | Low | Critical | High | Backups encrypted at rest; stored in private S3 bucket; accessible only to Railway infra role |
| DB-05 | **Database Audit Log Tampering** | Low | High | Medium | Append-only audit table (`audit_log`); `pactflow_app` role: INSERT only, no UPDATE/DELETE on audit tables |

### 10.2 Data Integrity Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| DB-06 | **Optimistic Lock Bypass** | Low | High | High | All aggregate roots have `@Version` column; `UPDATE ... WHERE version = ?` enforces atomic check-and-set |
| DB-07 | **Soft Delete Bypass** | Low | High | Medium | All queries include `WHERE is_deleted = false`; Spring Data `@Where` annotation applied globally to entities |
| DB-08 | **UUID Collision** | Very Low | High | Low | UUID v7 (time-ordered); collision probability is negligible (< 1 in 10^36); uniqueness constraint enforced |
| DB-09 | **Referential Integrity Violation** | Low | High | Low | Foreign key constraints enforced; `ON DELETE RESTRICT` on financial records |
| DB-10 | **Dirty Read of Escrow Status** | Low | High | Medium | Escrow status reads use `REPEATABLE_READ` isolation; no stale state possible during milestone transitions |
| DB-11 | **PII Stored Unencrypted** | Medium | High | High | AES-256 encryption at rest (database-level); email, display name also in application-level encrypted form for GDPR |

### 10.3 Injection Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| DB-12 | **SQL Injection via ORM** | Very Low | Critical | High | JPA named parameters; Hibernate never constructs SQL from user strings; Checkmarx SAST validates no raw SQL |
| DB-13 | **Schema Injection via Flyway** | Very Low | High | Medium | Flyway scripts are read-only files in source control; code review required for all migration changes |

---

## 11. Infrastructure Threats

### 11.1 Deployment & CI/CD Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| IN-01 | **CI/CD Pipeline Compromise** | Low | Critical | High | Protected `main` branch; 2 reviewers required; GitHub Actions pinned to specific SHA versions (`@sha256:...`) |
| IN-02 | **Docker Image Tampering** | Very Low | Critical | High | Images pushed to GHCR with SHA digest; Railway deploys by digest, not tag |
| IN-03 | **Malicious GitHub Action in PRs** | Low | High | High | `pull_request_target` trigger restricted; no secrets exposed in PR builds from forks |
| IN-04 | **Secret Leak in Build Logs** | Low | Critical | High | GitHub Actions secret masking; Railway never logs secret variable values; audit log for secret access |
| IN-05 | **Unpatched Base Docker Image** | Medium | High | High | Weekly Dependabot scanning for Docker base images; automated PR to update JRE base image |
| IN-06 | **Production Deployment without Tests** | Low | Critical | High | Deployment workflow requires CI pipeline pass; no manual bypass; health check gate before traffic switch |

### 11.2 Network & Cloud Threats

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|
| IN-07 | **TLS Downgrade Attack** | Very Low | Critical | High | `min_version = TLS 1.3`; HSTS preloading; Cloudflare enforces TLS minimum |
| IN-08 | **DNS Hijacking** | Very Low | Critical | High | DNSSEC enabled; Cloudflare DNS with `HTTPS` record; CAA records restrict SSL issuers |
| IN-09 | **BGP Route Hijacking** | Very Low | Critical | Low | Beyond our control; Cloudflare provides anycast DDoS resilience |
| IN-10 | **Redis Exposed to Internet** | Very Low | Critical | High | Redis private-network-only; `requirepass` configured; no public port |
| IN-11 | **Supply Chain Attack via npm** | Medium | High | High | `package-lock.json` committed; `npm ci` in CI; Dependabot alerts; no `postinstall` scripts from unknown packages |
| IN-12 | **Container Escape** | Very Low | Critical | Low | Railway managed container runtime; minimal container privileges; no `--privileged` flag |
| IN-13 | **Resource Exhaustion (OOM)** | Medium | Medium | Medium | JVM heap limits configured; HikariCP pool bounded; Redis `maxmemory` + LRU eviction policy |

---

## 12. API Abuse

### 12.1 API Attack Surface Catalog

| ID | Attack | Vector | Likelihood | Impact | Risk | Mitigation |
|---|---|---|---|---|---|---|
| AA-01 | **Mass Account Registration** | `POST /auth/register` | High | Medium | Medium | Rate limit 10/min per IP; CAPTCHA on repeated registrations; email verification required |
| AA-02 | **Password Spraying** | `POST /auth/login` | High | High | High | 10 attempts per IP per minute; account lockout after 10 failures in 30 min |
| AA-03 | **Wallet Challenge Flooding** | `GET /wallets/challenge` | High | Medium | Medium | 5 challenges per IP per minute; nonce TTL 5 min; Redis auto-expires unused challenges |
| AA-04 | **Project Spam Creation** | `POST /projects` | Medium | Medium | Medium | Rate limit: 60 mutations per user per minute; business rule: COMPANY role only |
| AA-05 | **Comment Spam** | `POST /projects/{id}/comments` | High | Low | Low | Rate limit; 1–5000 char limit; HTML stripped server-side |
| AA-06 | **Idempotency Key Reuse with Different Body** | Any POST | Low | Medium | Low | Idempotency key + body hash stored; mismatched body → 422 |
| AA-07 | **Parameter Pollution** | Query params | Medium | Low | Low | Spring MVC binds only declared `@RequestParam` fields; extra params ignored |
| AA-08 | **Large Payload Injection** | Request body | Medium | Medium | Medium | Max request body: 512KB enforced by Spring Boot `server.tomcat.max-http-form-post-size` |
| AA-09 | **Path Traversal in Resource IDs** | URL path params | Low | Medium | Low | UUID validation on all `{id}` path parameters; non-UUID → 400 immediately |
| AA-10 | **SSRF via Deliverable URL** | Milestone submission | Low | High | Medium | Backend never fetches deliverable URLs; they are stored-as-is and rendered client-side |
| AA-11 | **API Version Enumeration** | URL path | Low | Low | Low | Non-existent versions → 404; no version-specific error messages |
| AA-12 | **Scraping via Pagination Abuse** | GET list endpoints | Medium | Medium | Medium | Max `pageSize=100`; authenticated only; rate-limit per user |

### 12.2 Bot Detection Strategy

| Signal | Detection | Response |
|---|---|---|
| High request rate from single IP | Rate limit counter exceeds threshold | 429 with `Retry-After` |
| Multiple failed login attempts | Auth failure counter in Redis | Account lockout + admin alert |
| Wallet challenge flood without linking | Nonce TTL expiry + rate counter | Block challenge endpoint for IP |
| Registration with disposable email domain (future) | Domain blocklist check | 422 with error code |
| Behavioural anomaly — unusual hours + geo | PostHog + custom alert | Flag for review |

---

## 13. Rate Limiting

### 13.1 Rate Limit Tiers

| Tier | Scope | Limit | Window | Backend | Response on Exceed |
|---|---|---|---|---|---|
| **Global — Unauthenticated** | Per IP | 60 requests | 1 minute | Cloudflare + Bucket4j | 429 + `Retry-After` |
| **Global — Authenticated** | Per User ID | 300 requests | 1 minute | Bucket4j + Redis | 429 + `Retry-After` |
| **Authentication Endpoints** | Per IP | 10 requests | 1 minute | Bucket4j + Redis | 429 + lockout warning |
| **Wallet Challenge** | Per IP | 5 requests | 1 minute | Bucket4j + Redis | 429 |
| **Mutation Endpoints** | Per User ID | 60 requests | 1 minute | Bucket4j + Redis | 429 |
| **Analytics Read** | Per User ID | 30 requests | 1 minute | Bucket4j | 429 |
| **Admin Endpoints** | Per Admin User | 100 requests | 1 minute | Bucket4j | 429 + alert |
| **SSE Connection** | Per User ID | 3 concurrent | — | Spring SseEmitter | 429 — close old connection |

### 13.2 Rate Limit Headers

All rate-limited endpoints respond with:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1720776060
Retry-After: 18   (on 429 only)
```

### 13.3 Rate Limit Implementation Architecture

```
Incoming Request
      │
      ▼
[Cloudflare] — Network-level DDoS + volumetric rate limiting
      │
      ▼
[Spring Security Filter Chain]
      │
      ├── RateLimitFilter (Bucket4j)
      │   ├── Resolve bucket key (IP or userId)
      │   ├── Try consume 1 token from Redis-backed bucket
      │   ├── On empty bucket → return 429
      │   └── On success → proceed
      │
      ▼
Controller
```

### 13.4 Distributed Rate Limiting

For multi-instance deployment (2+ Spring Boot instances), Bucket4j is configured with a Redis backend using the Redisson client. All instances share the same rate limit counters. A user who hits Instance 1 then Instance 2 cannot bypass limits.

---

## 14. Secrets Management

### 14.1 Secret Classification

| Secret | Classification | Rotation Period | Storage |
|---|---|---|---|
| JWT HMAC Secret | **CRITICAL** | Quarterly + on-breach | Railway Secret Variable |
| PostgreSQL Password | **CRITICAL** | Quarterly + on-breach | Railway Secret Variable |
| Redis Password | **CRITICAL** | Quarterly + on-breach | Railway Secret Variable |
| Stellar Admin Private Key | **CRITICAL** | Annual + on-breach | Hardware multi-sig wallet |
| Email API Key (SendGrid) | **HIGH** | Semi-annual | Railway Secret Variable |
| Sentry DSN | **MEDIUM** | Annual | Railway Config Variable |
| PostHog API Key | **MEDIUM** | Annual | Railway Config Variable |
| Soroban Contract Address | **LOW** (public) | — | Environment config |
| Horizon RPC URL | **LOW** (public) | — | Environment config |

### 14.2 Secret Lifecycle Rules

| Rule | Enforcement |
|---|---|
| Secrets never committed to git | `.gitignore` enforces `.env*`; GitHub secret scanning enabled on all pushes |
| Secrets never in build logs | GitHub Actions secret masking; Railway environment variable values never logged |
| Secrets never in error messages | `GlobalExceptionHandler` strips internal exception messages from production responses |
| Secrets never in URLs | All sensitive values in request body or `Authorization` header; never in query string |
| Secrets never logged | SLF4J structured logging reviewed for sensitive field names; custom serializer masks `password`, `token`, `secret` fields |
| Local developer secrets | `application-local.yml` (git-ignored); never share via Slack/email |

### 14.3 Secret Rotation Procedure

For **JWT Secret Rotation:**
1. Generate new 256-bit secret.
2. Configure new secret as `JWT_SECRET_KEY_NEW` alongside `JWT_SECRET_KEY_OLD`.
3. Deploy: backend accepts tokens signed with either key (grace period = 15 min access token TTL).
4. After 15 minutes: remove `JWT_SECRET_KEY_OLD`.
5. All existing sessions continue via refresh token rotation.

For **Database Password Rotation:**
1. Add new credentials to DB.
2. Update `DB_PASSWORD` in Railway (zero-downtime via HikariCP reconnect).
3. Revoke old credentials after 5 minutes.

### 14.4 Secrets in Development

| Environment | Mechanism | Git Risk |
|---|---|---|
| Local Development | `application-local.yml` (git-ignored) | None |
| CI Testing | GitHub Actions Secrets (masked) | None |
| Staging | Railway Secret Variables | None |
| Production | Railway Secret Variables | None |

---

## 15. Logging & Auditing

### 15.1 Audit Event Catalog

Every security-relevant action generates an immutable audit log entry. The `audit_log` table has INSERT-only permissions for `pactflow_app` — no UPDATE or DELETE is permitted.

| Event | Actor | Data Captured |
|---|---|---|
| `USER_REGISTERED` | System | userId, email (hashed), accountType, ipAddress, userAgent, timestamp |
| `USER_LOGIN_SUCCESS` | User | userId, sessionId, ipAddress, userAgent, timestamp |
| `USER_LOGIN_FAILURE` | System | attemptedEmail (hashed), ipAddress, userAgent, failureReason, timestamp |
| `USER_LOGOUT` | User | userId, sessionId, timestamp |
| `PASSWORD_RESET_REQUESTED` | User | userId, ipAddress, timestamp |
| `PASSWORD_RESET_COMPLETED` | User | userId, ipAddress, timestamp |
| `EMAIL_VERIFIED` | User | userId, timestamp |
| `WALLET_LINKED` | User | userId, publicKey (truncated), walletProvider, ipAddress, timestamp |
| `WALLET_UNLINKED` | User | userId, walletId, publicKey (truncated), timestamp |
| `WALLET_SET_PRIMARY` | User | userId, walletId, timestamp |
| `PROJECT_CREATED` | Company User | userId, projectId, assigneeId, budgetXlm, timestamp |
| `PROJECT_CANCELLED` | Company User | userId, projectId, reason, timestamp |
| `ESCROW_PREPARE_INITIATED` | Company User | userId, milestoneId, amountXlm, timestamp |
| `MILESTONE_APPROVED` | Company User | userId, milestoneId, escrowId, timestamp |
| `REFUND_REQUESTED` | Company User | userId, milestoneId, reason, timestamp |
| `ADMIN_USER_DEACTIVATED` | Admin | adminId, targetUserId, timestamp |
| `ADMIN_USER_VIEWED` | Admin | adminId, targetUserId, timestamp |
| `CONTRACT_PAUSED` | Admin | adminId, contractAddress, timestamp |
| `CONTRACT_UNPAUSED` | Admin | adminId, contractAddress, timestamp |
| `RATE_LIMIT_EXCEEDED` | System | ipAddress or userId, endpoint, timestamp |
| `INVALID_JWT_PRESENTED` | System | ipAddress, endpoint, rejectionReason, timestamp |
| `INVALID_WALLET_SIGNATURE` | System | publicKey (truncated), ipAddress, timestamp |

### 15.2 Log Format Standard

All logs are structured JSON, shipped to centralized log storage:

```json
{
  "timestamp": "2026-07-12T07:45:00.000Z",
  "level": "INFO",
  "service": "pactflow-api",
  "environment": "production",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "userId": "01923abc-...",
  "sessionId": "01923def-...",
  "ipAddress": "sha256:a9b8c7...",
  "event": "WALLET_LINKED",
  "outcome": "SUCCESS",
  "publicKey": "GABC...XYZ",
  "walletProvider": "FREIGHTER",
  "message": "Wallet linked successfully after Ed25519 verification."
}
```

**Privacy Rules:**
- Raw email addresses NEVER in logs — store SHA-256 hash only.
- Raw IP addresses NEVER in logs — store SHA-256(ip + daily_salt) only.
- JWT values NEVER logged.
- Private keys NEVER logged (and never server-side).
- Passwords NEVER logged.

### 15.3 Log Retention Policy

| Log Type | Retention | Storage |
|---|---|---|
| Security audit logs | 2 years | Railway + S3 cold storage |
| Application logs | 90 days | Railway log stream |
| Error tracking (Sentry) | 90 days | Sentry |
| Blockchain event logs | Permanent | PostgreSQL `blockchain_transactions` |

### 15.4 Alerting Rules from Logs

| Condition | Threshold | Alert Channel |
|---|---|---|
| `USER_LOGIN_FAILURE` for same userId | > 5 in 5 minutes | Slack `#security-alerts` |
| `INVALID_JWT_PRESENTED` from single IP | > 20 in 1 minute | Slack `#security-alerts` |
| `INVALID_WALLET_SIGNATURE` | > 10 in 5 minutes | Slack `#security-alerts` |
| `CONTRACT_PAUSED` event | Any | PagerDuty critical alert |
| `RATE_LIMIT_EXCEEDED` from single IP | > 100 in 1 minute | Slack `#security-alerts` |
| `ADMIN_USER_DEACTIVATED` | Any | Slack `#admin-audit` |
| Ingestion daemon lag > 500 ledgers | Any | Slack `#infra-alerts` |

---

## 16. Incident Response

### 16.1 Incident Severity Levels

| Severity | Definition | Response Time | Examples |
|---|---|---|---|
| **P0 — Critical** | Active fund theft, mass account compromise, contract exploitation | Immediate (< 15 min) | Admin key compromise, SQLi exploitation, contract pause abused |
| **P1 — High** | Potential data breach, authentication bypass, escrow desync | < 1 hour | JWT secret leaked, DB backup exposed, ingestion daemon stopped |
| **P2 — Medium** | Service degradation, suspicious activity patterns | < 4 hours | API availability < 95%, high rate limit triggers, unusual login geo |
| **P3 — Low** | Non-critical security findings, policy violations | < 24 hours | Expired TLS cert warning, minor dependency CVE |

### 16.2 Incident Response Playbooks

#### Playbook P0-A: Suspected Smart Contract Exploit

```
1. DETECT     Sentry alert / user report / on-chain anomaly detected
              ↓
2. CONTAIN    Admin executes pause() on Soroban contract via multi-sig
              (requires 2-of-3 hardware key holders)
              ↓
3. ASSESS     Review Stellar Explorer for anomalous transactions
              Review ingestion daemon logs for unexpected events
              Quantify affected escrows and amounts
              ↓
4. NOTIFY     Notify affected users via email
              Post status update on status.pactflow.io
              Engage Stellar security community if needed
              ↓
5. REMEDIATE  Deploy patched contract (new contract address)
              Migrate active escrows to new contract
              Verify all funds accounted for
              ↓
6. RECOVER    Unpause operations on new contract
              ↓
7. POST-MORTEM Write incident report within 72 hours
               Publish abbreviated version publicly
```

#### Playbook P0-B: JWT Secret Compromise

```
1. DETECT     Suspicious logins from anomalous locations / devices
              ↓
2. CONTAIN    Immediately rotate JWT_SECRET_KEY in Railway
              All existing access tokens invalidated instantly
              ↓
3. INVALIDATE  Bulk delete all user_sessions records
              All users must re-authenticate
              ↓
4. NOTIFY     Email all users: "We detected suspicious activity.
              You have been logged out for your security."
              ↓
5. INVESTIGATE Audit logs: identify how secret was accessed
              Review all API calls made with forged tokens
              ↓
6. HARDEN     Review secret storage procedures
              Assess whether migration to RS256 (asymmetric) is warranted
              ↓
7. POST-MORTEM Within 48 hours; regulatory notification if PII exposed
```

#### Playbook P1-A: Database Breach Suspected

```
1. DETECT     Unusual query volume / data exfil pattern in DB logs
              ↓
2. CONTAIN    Revoke pactflow_app DB credentials immediately
              Rotate to new credentials; redeploy API instances
              ↓
3. ASSESS     Review pg_stat_activity for suspicious sessions
              Review query logs for anomalous SELECTs
              ↓
4. PRESERVE   Snapshot current DB state for forensics
              Archive all logs to immutable storage
              ↓
5. NOTIFY     If PII accessed: GDPR 72-hour breach notification clock starts
              Notify affected users
              ↓
6. REMEDIATE  Patch the exploited vulnerability
              Re-audit all DB access controls
              ↓
7. POST-MORTEM Regulatory filing if required (GDPR Article 33)
```

#### Playbook P1-B: Ingestion Daemon Desync

```
1. DETECT     Monitoring alert: ingestion lag > 1000 ledgers
              ↓
2. ASSESS     Compare milestone statuses in DB vs on-chain via Stellar Explorer
              Identify which ledgers were missed
              ↓
3. CONTAIN    Prevent new escrow operations (toggle maintenance mode)
              ↓
4. RESYNC     Daemon restart (auto-resumes from cursor)
              If cursor corrupted: manual ledger recovery from Horizon history
              ↓
5. RECONCILE  Verify all affected milestones updated correctly
              ↓
6. RESTORE    Re-enable operations
              ↓
7. POST-MORTEM Root cause analysis; improve daemon resilience
```

### 16.3 Communication Templates

**User-Facing Security Incident Email:**
```
Subject: [PactFlow] Important Security Notice — Action Required

We detected unusual activity affecting your account.

As a precaution, we have logged you out of all sessions.
Your funds secured in escrow contracts are safe and unaffected.

Please log in again and verify your account activity.

If you notice anything suspicious, contact security@pactflow.io immediately.

We are actively investigating and will provide updates at status.pactflow.io.

— The PactFlow Security Team
```

---

## 17. Disaster Recovery

### 17.1 Recovery Objectives

| Metric | Target | Notes |
|---|---|---|
| **RTO** (Recovery Time Objective) | < 4 hours for P0 | Time from incident detection to full service restoration |
| **RPO** (Recovery Point Objective) | < 1 hour | Maximum acceptable data loss window |
| **MTTR** (Mean Time to Recovery) | < 2 hours target | Historical average for non-P0 incidents |

### 17.2 Backup Strategy

| Asset | Backup Frequency | Retention | Location | Encryption |
|---|---|---|---|---|
| PostgreSQL — Full backup | Daily at 02:00 UTC | 30 days | Railway managed + S3 Glacier | AES-256 |
| PostgreSQL — WAL streaming | Continuous | 7 days | Railway managed | AES-256 |
| PostgreSQL — Point-in-time recovery | On demand | 7 days | Railway managed | AES-256 |
| Redis cache | No backup needed | — | — | — (rebuildable) |
| Application code | Git repository | Permanent | GitHub + mirror | — |
| Docker images | GHCR | 90 days per tag | GitHub Container Registry | — |
| Soroban contract binary | WASM on-chain | Permanent | Stellar network | — |
| Audit logs | Real-time ship | 2 years | S3 + Railway | AES-256 |

### 17.3 Recovery Runbooks

#### RB-01: Database Recovery from Backup

```
Prerequisites: Access to Railway dashboard + AWS S3 credentials

Steps:
1. Provision new PostgreSQL instance on Railway
2. Restore latest full backup: pg_restore --clean --if-exists
3. Apply WAL segments to bring to RPO point
4. Run Flyway migrations (idempotent; skips already-applied)
5. Verify row counts against pre-incident snapshot
6. Update DB_URL in Railway environment variables
7. Redeploy API instances (zero-downtime rolling deploy)
8. Verify health probes pass
9. Validate sample business queries (projects, milestones)
10. Enable traffic; monitor error rate for 15 minutes

Estimated RTO: 60-90 minutes
```

#### RB-02: Redis Failure Recovery

```
Steps:
1. Railway auto-restarts Redis on OOM or crash
2. If persistent failure: provision new Redis instance
3. Update REDIS_URL in Railway environment variables
4. Redeploy API instances
5. Effect: All active user sessions invalidated — users must re-login
6. Effect: Rate limit counters reset (acceptable for recovery)
7. Wallet challenge nonces lost — any in-flight wallet connections must restart

Estimated RTO: 15-30 minutes
Data loss: Session cache (acceptable); no financial data in Redis
```

#### RB-03: Ingestion Daemon Recovery

```
Steps:
1. Railway auto-restarts daemon on crash (configured with restart policy)
2. On restart: daemon reads last_processed_ledger from DB
3. Resumes polling from (last_processed_ledger + 1)
4. All events since crash are replayed in order
5. Idempotency check (tx_hash UNIQUE) prevents duplicate processing
6. No manual intervention required for clean crash

For corrupted cursor:
1. Set last_processed_ledger to (target_ledger - 100) as safe buffer
2. Daemon replays 100 ledgers; idempotency handles any duplicates
3. Monitor until daemon catches up to current ledger

Estimated RTO: Automatic; < 5 minutes for clean crash
```

### 17.4 Business Continuity During Outage

| Outage Scenario | User Impact | Mitigation |
|---|---|---|
| API fully down | No project/milestone operations | Status page; ETA communicated; funds in escrow are safe on-chain |
| Frontend down | No UI access | Direct API access for technical users; status page |
| DB down | No data reads or writes | Read-only cached views via CDN (future); escrow funds safe on-chain |
| Ingestion daemon down | Milestone statuses don't update in UI | No fund movement; UI shows last known state; resync on restart |
| Stellar network disruption | Cannot fund/release escrows | Inform users; retry when network restores; no data loss |

---

## 18. Security Testing Strategy

### 18.1 Static Analysis (SAST)

| Tool | Scope | When | Finding Threshold |
|---|---|---|---|
| **Checkmarx / SonarQube** | Java backend source | Every PR | Critical/High findings block merge |
| **ESLint Security Plugin** | TypeScript frontend | Every PR | Critical findings block merge |
| **cargo-audit** | Rust contract dependencies | Every contract change | Any CVE blocks merge |
| **cargo-clippy** | Rust contract source | Every contract change | Warnings treated as errors |
| **Semgrep** | Full monorepo | Weekly scheduled scan | Report to security channel |

### 18.2 Dependency Analysis (SCA)

| Tool | Scope | When |
|---|---|---|
| **Dependabot** | All packages (Maven, npm, Cargo) | Daily automated PR generation |
| **OWASP Dependency Check** | Maven dependencies | Every PR + weekly full scan |
| **Snyk (future)** | Multi-language SCA | On every build |

### 18.3 Dynamic Analysis (DAST)

| Tool | Scope | When | Finding Threshold |
|---|---|---|---|
| **OWASP ZAP** | Staging API endpoints | Before every production release | High findings require mitigation |
| **Burp Suite Community** | Manual pen test | Quarterly | All findings tracked to resolution |
| **Playwright Security Scenarios** | Frontend XSS/CSRF | Every CI run | Must pass |

### 18.4 Smart Contract Security Testing

| Test Type | Tool | Coverage Target | When |
|---|---|---|---|
| Unit tests | Soroban test framework | ≥ 90% function coverage | Every contract PR |
| State machine exhaustiveness | Custom parameterised test | All (state, function) combinations | Every contract PR |
| Fuzzing | `cargo-fuzz` | 1 hour minimum per function | Before mainnet deploy |
| Static analysis | `cargo-audit` + `clippy` | All warnings resolved | Every contract PR |
| Formal verification | Certora Prover (future) | Critical functions | Pre-mainnet audit |
| Independent audit | External auditing firm | Full contract scope | Before mainnet launch |

**Required Security Tests per Contract Function:**

| Function | Tests Required |
|---|---|
| `release_payment` | Unauthorized caller, wrong state (all 7 states), replay of completed TX, amount mismatch |
| `request_refund` | Unauthorized caller, wrong state, double refund |
| `expire` | Pre-expiration call, post-expiration call, already-terminal escrow |
| `create_escrow` | Duplicate escrow_id, invalid amount, client==freelancer, past expiration |
| `fund` | Insufficient balance, wrong state, wrong caller, amount mismatch |

### 18.5 Penetration Testing Plan

**Frequency:** Quarterly internal pentest; annual external pentest.

| Target Area | Attack Scenarios |
|---|---|
| **Authentication** | Credential stuffing, session fixation, JWT confusion, token replay |
| **Authorization** | IDOR, privilege escalation, RBAC bypass, broken function access |
| **Wallet Integration** | Nonce replay, challenge flooding, wallet address spoofing |
| **API** | Mass assignment, parameter tampering, path traversal, SSRF |
| **Frontend** | XSS (stored, reflected, DOM), CSRF, clickjacking, open redirect |
| **Smart Contract** | Unauthorized release, double spend, expiration bypass, storage abuse |
| **Infrastructure** | Port scanning, SSL/TLS config, header inspection, exposed admin panels |

### 18.6 Security Regression Tests

After every security incident or finding, a regression test is added to CI to prevent re-occurrence. These tests are tagged `@SecurityRegression` and must never be disabled.

---

## 19. Security Checklist

### 19.1 Pre-Launch Security Checklist (Level 4 MVP)

#### Authentication & Authorization
- [ ] Argon2id password hashing configured with recommended parameters (time=3, memory=64MB, parallelism=2)
- [ ] JWT access token TTL = 15 minutes maximum
- [ ] JWT secret is 256+ bit random value stored in Railway Secret Variable
- [ ] Refresh tokens stored as SHA-256 hash only in DB
- [ ] Refresh token rotation on every use
- [ ] Refresh token cookie: `httpOnly`, `Secure`, `SameSite=Strict`
- [ ] Email verification required before wallet linking
- [ ] Account lockout after 10 failed login attempts
- [ ] `@PreAuthorize` annotations on all controller methods
- [ ] Service layer ownership verification on all resource reads
- [ ] Admin role cannot call contract fund-moving functions

#### Wallet Security
- [ ] Ed25519 nonce challenge implemented and tested
- [ ] Nonce stored in Redis with 5-minute TTL
- [ ] Nonce deleted on first successful use
- [ ] Wallet address uniqueness enforced at DB level
- [ ] `client ≠ freelancer` validation on project creation
- [ ] `require_auth()` used on all state-changing contract functions
- [ ] Unsigned XDR returned to frontend (server never signs)
- [ ] Wallet challenge rate limited to 5/min per IP

#### Smart Contract
- [ ] All STRIDE threats reviewed against contract code
- [ ] 90%+ unit test coverage on contract
- [ ] State machine exhaustiveness test passes
- [ ] Fuzzing run for minimum 1 hour per critical function
- [ ] `pause()` / `unpause()` requires multi-sig in production
- [ ] Admin address ≠ any user wallet address
- [ ] `platform_reference_id` is hash, not raw UUID
- [ ] Contract address published in official docs + UI
- [ ] Emergency pause tested on testnet

#### API Security
- [ ] Rate limiting configured for all tiers (see Section 13.1)
- [ ] RFC 7807 error format — no stack traces in production responses
- [ ] Max request body size = 512KB enforced
- [ ] UUID validation on all path parameter IDs
- [ ] CORS allowlist: only `https://pactflow.io` and `https://app.pactflow.io`
- [ ] All endpoints require `Content-Type: application/json` for body requests
- [ ] Idempotency key handling implemented and tested
- [ ] Pagination maximum (`pageSize=100`) enforced

#### Frontend Security
- [ ] Security headers implemented (see Section 9.2)
- [ ] Content Security Policy in strict mode
- [ ] No `dangerouslySetInnerHTML` in production code
- [ ] All user-generated content HTML-stripped on server
- [ ] Deliverable URLs validated to `https://` only
- [ ] SRI hashes on all third-party CDN assets
- [ ] No secrets in client-side environment variables (`NEXT_PUBLIC_*`)
- [ ] PostHog configured to scrub PII fields

#### Database Security
- [ ] PostgreSQL not exposed on public port
- [ ] Three DB roles configured (pactflow_app, pactflow_ingestion, pactflow_readonly)
- [ ] `pactflow_app` cannot write to escrow_contracts or blockchain_transactions
- [ ] `audit_log` table: INSERT only for pactflow_app
- [ ] All aggregate roots have `@Version` column for optimistic locking
- [ ] `is_deleted = false` filter applied globally to all entity queries
- [ ] Point-in-time recovery tested and verified
- [ ] Backup restoration drilled and documented

#### Infrastructure Security
- [ ] TLS 1.3 minimum enforced
- [ ] HSTS preload list submission
- [ ] DNSSEC enabled
- [ ] GitHub secret scanning enabled
- [ ] Dependabot enabled for all package ecosystems
- [ ] `main` branch protected (2 reviewer minimum)
- [ ] GitHub Actions pinned to SHA
- [ ] Docker images signed and deployed by digest
- [ ] No secrets in `.env` files committed to repository
- [ ] `.gitignore` reviewed for secret file patterns

#### Monitoring & Incident Response
- [ ] Sentry configured for both API and frontend
- [ ] PostHog PII scrubbing configured
- [ ] All audit events logging to `audit_log` table
- [ ] Security alerting rules configured in monitoring (see Section 15.4)
- [ ] Incident response playbooks documented and rehearsed
- [ ] Security team contact: `security@pactflow.io` functional
- [ ] Status page: `status.pactflow.io` configured
- [ ] On-call rotation established

#### Compliance
- [ ] GDPR: Privacy policy published
- [ ] GDPR: Data retention policy documented and enforced
- [ ] GDPR: Erasure endpoint implemented (`DELETE /users/me`)
- [ ] GDPR: No PII stored on-chain verified
- [ ] Cookie consent banner implemented
- [ ] SPF, DKIM, DMARC records configured for `pactflow.io`

---

## 20. Future Security Roadmap

### Phase 1 — Level 4 Hardening (Q3 2026)

| Initiative | Priority | Effort | Value |
|---|---|---|---|
| Migrate JWT from HS256 to RS256 (asymmetric) | High | Medium | Enables micro-service token verification without shared secret |
| Admin MFA enforcement (TOTP) | Critical | Low | Prevents admin account takeover |
| OWASP ZAP automated scan in CI | High | Low | Catches API security regressions automatically |
| Independent smart contract security audit | Critical | High | Required before mainnet launch |
| Penetration test by external firm | High | High | Validates overall security posture |
| Rate limit anomaly detection | Medium | Medium | Detect coordinated attacks early |
| Breach password database integration (HaveIBeenPwned API) | Medium | Low | Reject known compromised passwords at registration |

### Phase 2 — Level 5 Security Additions (Q4 2026 – Q1 2027)

| Initiative | Triggered By | Description |
|---|---|---|
| **Contract Upgrade Time-Lock** | Contract v2 | 48-hour delay between upgrade announcement and execution; community review window |
| **Multi-Party Dispute Escrow** | Level 5 disputes | Arbitrator co-signature required for dispute resolution; 2-of-3 multisig pattern |
| **Wallet Transaction Insurance** | Business requirement | Partnership with Stellar-native insurance protocol for escrow loss coverage |
| **Fraud Detection Engine** | Scale | ML model on transaction patterns; flag anomalous amounts, velocity, geo |
| **KYC/AML Integration** | Regulatory | Optional identity verification for high-value escrows (> 10,000 XLM) |
| **Bug Bounty Program** | Responsible disclosure | HackerOne program; Critical: $5,000; High: $1,000; Medium: $250 |
| **SOC 2 Type I Audit** | Enterprise sales | Security policy documentation + audit evidence collection |
| **Webhook Signature Verification** | Level 5 webhooks | HMAC-SHA256 signatures on all outgoing webhook payloads |

### Phase 3 — Level 6–7 Enterprise Security (2027+)

| Initiative | Description |
|---|---|
| **SOC 2 Type II Certification** | 12-month observation period; required for enterprise contracts |
| **ISO 27001 Alignment** | ISMS documentation and controls implementation |
| **Formal Contract Verification** | Certora Prover or K Framework for mathematical correctness proofs |
| **Hardware Security Modules (HSMs)** | Replace software-based JWT signing with HSM-backed key storage |
| **Zero-Knowledge Proofs** | Verify freelancer identity / reputation without revealing PII |
| **Multi-Region Key Management** | AWS KMS or HashiCorp Vault for distributed secret management |
| **Real-Time SIEM** | Splunk or Elastic Security for correlated security event analysis |
| **Privileged Access Management (PAM)** | Just-in-time DB access for engineers; no persistent SSH |
| **Supply Chain Security (SLSA Level 3)** | Signed build provenance; attestations on every Docker image |
| **Decentralised Identity (DID)** | W3C DID for freelancer credential portability |

### 20.1 Security Maturity Model

```
Level 4 MVP (Current)
├── ✅ JWT authentication with refresh rotation
├── ✅ Ed25519 wallet signature verification
├── ✅ Role-based access control
├── ✅ Rate limiting
├── ✅ Security headers
├── ✅ Structured audit logging
├── ✅ Smart contract authorization model
└── 🔲 External contract audit (pre-mainnet)

Level 5 (Q4 2026)
├── ✅ All Level 4
├── 🔲 Admin MFA (TOTP)
├── 🔲 RS256 JWT migration
├── 🔲 Bug bounty program
├── 🔲 Fraud detection engine
└── 🔲 Contract upgrade time-lock

Level 6 (2027)
├── ✅ All Level 5
├── 🔲 SOC 2 Type I
├── 🔲 KYC/AML integration
├── 🔲 HSM-backed signing
└── 🔲 Formal contract verification

Level 7 (2027+)
├── ✅ All Level 6
├── 🔲 SOC 2 Type II
├── 🔲 ISO 27001
├── 🔲 Real-time SIEM
└── 🔲 Zero-knowledge privacy layer
```

---

## Appendix: Security Contact & Disclosure Policy

### Responsible Disclosure

PactFlow operates a coordinated vulnerability disclosure policy.

**To report a security vulnerability:**
- Email: `security@pactflow.io`
- PGP key: Published at `https://pactflow.io/.well-known/security.txt`
- Response commitment: Acknowledge within 24 hours, triage within 72 hours

**In-scope:**
- API endpoints
- Authentication and authorization bypass
- Smart contract logic flaws
- Sensitive data exposure
- Cryptographic weaknesses

**Out-of-scope:**
- Rate limiting bypass without demonstrated impact
- Social engineering
- Physical security
- Third-party services not under PactFlow control

**Rewards (Bug Bounty — Level 5+ launch):**

| Severity | Reward |
|---|---|
| Critical (fund theft, contract exploit) | $5,000 |
| High (auth bypass, mass data exposure) | $1,000 |
| Medium (IDOR, session issues) | $250 |
| Low (information disclosure) | Hall of Fame |

---

*End of PactFlow Security Threat Model v1.0*

*This document must be reviewed by the security team lead after every major architectural change, after every incident, and on a minimum quarterly cadence. The threat landscape evolves — this document must evolve with it.*
