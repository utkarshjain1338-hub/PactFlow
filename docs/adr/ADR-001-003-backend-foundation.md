# ADR 001 — Gradle over Maven for Backend Build Tool

**Date:** 2026-07-12  
**Status:** Accepted  
**Authority:** PROJECT_CONSTITUTION.md §12 (ADRs required for major architecture/library choices)  
**Deciders:** Backend Team Lead, Platform Team  

---

## Context

The `SYSTEM_ARCHITECTURE.md §13.3` CI pipeline references `Maven + npm run build`. However, the Backend Foundation milestone specification explicitly requires Gradle. Both are mature JVM build tools capable of satisfying all project requirements.

## Decision

Use **Gradle 8.9** with the Kotlin DSL syntax (Groovy DSL for compatibility with all Spring Boot 3 samples) as the backend build tool.

## Rationale

| Criterion | Gradle | Maven |
|---|---|---|
| Spring Boot 3 support | ✅ First-class | ✅ First-class |
| Incremental builds | ✅ Superior (build cache) | ⚠️ Limited |
| Multi-project builds | ✅ Native | ⚠️ Complex |
| Integration test source sets | ✅ Native | ⚠️ Requires plugin |
| Checkstyle integration | ✅ Built-in plugin | ✅ Plugin |
| JaCoCo coverage | ✅ Built-in plugin | ✅ Plugin |
| CI caching | ✅ Gradle cache action | ✅ Maven cache action |
| Specification requirement | ✅ Required | ❌ Not in spec |

## Consequences

- CI pipeline uses `./gradlew` commands instead of `mvn`
- `build.gradle` replaces `pom.xml` as the build descriptor
- Gradle Wrapper ensures consistent version across environments
- `./gradlew bootJar` produces the deployable artifact (`pactflow-backend.jar`)

---

# ADR 002 — Argon2id for Password Hashing

**Date:** 2026-07-12  
**Status:** Accepted  
**Authority:** DOMAIN_MODEL.md §9, SECURITY_THREAT_MODEL.md §1.3  

---

## Context

The application stores user passwords (email + password login flow). The hash algorithm choice has significant security implications — a weak algorithm enables offline cracking attacks if the database is compromised.

## Decision

Use **Argon2id** via Spring Security's `Argon2PasswordEncoder` with parameters:
- Salt length: 16 bytes (128-bit)
- Hash length: 32 bytes (256-bit)
- Parallelism: 1
- Memory cost: 65,536 KB (64 MB)
- Iterations: 3

## Rationale

- OWASP recommends Argon2id as the primary password hashing function (2023)
- Spring Security provides `Argon2PasswordEncoder` out of the box
- 64 MB memory cost makes GPU/ASIC cracking attacks infeasible
- Parameters tuned for Railway single-core instances (p=1)
- Explicit mandate in DOMAIN_MODEL.md §9: "Password hashes: Argon2id only"

## Consequences

- Registration and login operations take ~300-500ms for hashing (acceptable; security > speed)
- BCrypt (legacy) is NOT used, eliminating 72-char password truncation vulnerability
- All existing password hashes must be migrated if switching from another algorithm

---

# ADR 003 — Transactional Outbox Pattern for Domain Event Delivery

**Date:** 2026-07-12  
**Status:** Accepted  
**Authority:** SYSTEM_ARCHITECTURE.md §11.3, PROJECT_CONSTITUTION.md Rule 6  

---

## Context

Domain events (ProjectCreated, MilestoneStatusChanged, etc.) must be delivered reliably to consumers (NotificationService, AnalyticsService, SSE stream). The naive approach of publishing to a message bus directly in the application service risks event loss if the application crashes after the DB commit but before the event publish.

## Decision

Use the **Transactional Outbox Pattern**:
1. Application service writes domain state + outbox event in the same DB transaction
2. A `@Scheduled` processor polls `outbox_events WHERE status='PENDING'` every 1 second
3. Processor dispatches events to handlers and marks them `PROCESSED`
4. Failed events (after 5 retries) are marked `FAILED` for manual review

## Rationale

- Guarantees at-least-once delivery without a message broker (no Kafka dependency in MVP)
- Events survive application crashes — always committed atomically with domain state
- Dead-letter events (retry_count >= 5) surface in monitoring as an alert
- Idempotent event handlers + `tx_hash` uniqueness ensure exactly-once processing for escrow events

## Consequences

- 1-second delivery latency for domain events (acceptable for notification use case)
- `outbox_events` table requires periodic cleanup (PROCESSED events after 7 days)
- SSE real-time delivery is eventually consistent (user sees "Pending" until daemon confirms)
