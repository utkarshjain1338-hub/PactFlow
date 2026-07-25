# PactFlow - Copilot Context

This document provides essential context for AI assistants and GitHub Copilot to understand the PactFlow project architecture, constraints, and business logic.

## 1. Project Overview
**PactFlow** is a freelance collaboration platform bridging modern SaaS project management with decentralized escrow technology using the Stellar (Soroban) blockchain. 
* **Backend:** Spring Boot (Java 21).
* **Frontend:** Next.js 15 (React, TypeScript).
* **Blockchain:** Soroban Smart Contracts (Rust) + Stellar Wallets.
* **Database:** PostgreSQL for app state, Redis for caching/rate-limiting.

## 2. Architecture & Design Principles
The project strictly follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles:
* **Domain Layer (`domain`):** Contains pure models, entities, value objects, and business rules. Has ZERO dependencies on frameworks (Spring, JPA, Web).
* **Application Layer (`application`):** Orchestrates use cases via Services, handles transactions, defines Ports, and contains DTOs.
* **Infrastructure Layer (`infrastructure`):** Implements ports (Spring Web REST controllers, JPA Repositories, Soroban RPC integrations, Security).

**Strict Rules (Non-Negotiable):**
1. **Never Revert Business State:** Blockchain errors (e.g. timeout, rejected signature) are retryable. Never roll back a business state like `APPROVED` to `REVIEW` just because a blockchain transaction failed. 
2. **Blockchain for Trust Only:** Project management details (chat, files) live in Postgres. Soroban only handles Escrow, Funds, and Releases.
3. **Frontend is Presentation:** All business logic, authorization, and wallet verification happen in the Spring Boot backend.
4. **No Generic Endpoints:** Design endpoints based on business actions (e.g., `POST /projects/{id}/milestones/{id}/approve`), not CRUD (`PATCH /milestone`).
5. **No Ad-Hoc Utilities:** Keep logic encapsulated within Domain aggregates or Application services. Avoid creating generic static utility classes.

## 3. Core Business Flows
### Milestones & Deliverables
* A `Project` contains `Milestone`s.
* Milestones follow strict state transitions: `DRAFT` -> `FUNDED` -> `IN_PROGRESS` -> `IN_REVIEW` -> `APPROVED` -> `PAID` (or `REJECTED`).
* State transition logic resides securely inside the `Milestone` domain aggregate (e.g., `milestone.approve()`).

### Escrow & Blockchain
* `Escrow` aggregates track the on-chain status corresponding to a Milestone.
* **Wallet Verification:** Only cryptographically verified primary wallets can perform blockchain actions. Application services must call `WalletService.assertVerifiedPrimaryWallet(userId)` before building transactions.
* The backend generates unsigned XDR transactions (`SorobanService.build*`) which the frontend prompts the user's wallet to sign and submit.

## 4. Testing Requirements
* Every new business logic flow must include unit tests for the Application Service and WebMvc tests for the REST Controller.
* Assertions must cover Happy Paths, Negative Paths (Invalid State Transitions), and Authorization failures (HTTP 403/401).

## 5. Folder Structure Summary
```text
backend/src/main/java/com/pactflow/
 ├── domain/           # Pure Java. Aggregates (Escrow, Milestone, User).
 ├── application/      # Spring Services, Use Cases, DTOs, Exceptions.
 └── infrastructure/   # Spring Controllers, JPA Entities, Repositories, Security.
```

*When suggesting code, prioritize extending existing domain methods over creating new services, and always adhere strictly to the Domain -> Application -> Infrastructure dependency rule.*
