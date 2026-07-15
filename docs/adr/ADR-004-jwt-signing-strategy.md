# ADR 004: Stateless JWT Authentication & HMAC-SHA256 (HS256) Signing Strategy

## Status
Accepted

## Context
PactFlow requires a scalable, stateless authentication mechanism that isolates domain logic from stateful session bottlenecks while enforcing rigorous security checks (AT-03..AT-08, AZ-02..AZ-05). Per `SYSTEM_ARCHITECTURE.md §8` and `API_SPECIFICATION.md Domain 1`, access tokens must be short-lived (15-minute TTL) JSON Web Tokens (JWTs) delivered via the `Authorization: Bearer` header, paired with opaque, long-lived (30-day TTL) refresh tokens whose SHA-256 hashes are persisted in `user_sessions`.

For token signing, we evaluated asymmetric (`RS256` / `EdDSA`) versus symmetric (`HS256`) algorithms:
1. **Symmetric (`HS256`)**: Requires a shared secret (`256+ bits`) across token issuers and verifiers. Extremely fast, low CPU overhead, and ideal for our monolithic Spring Boot API boundary where both token issuance (`/auth/login`) and verification (`JwtAuthenticationFilter`) occur within the same application deployment.
2. **Asymmetric (`RS256` / `EdDSA`)**: Uses private/public key pairs, allowing decentralized verification without sharing the signing key. Essential when third-party services or independent microservices must verify tokens without holding the secret.

## Decision
We adopt **HMAC-SHA256 (`HS256`)** as our initial MVP signing algorithm for JWT access tokens, with an explicit, architecturally decoupled migration path to **`RS256`** when the platform expands to microservices or external gateway verifiers.

### Key Implementation Rules:
1. **Secret Key Management (`AT-04`)**: The `HS256` secret (`pactflow.security.jwt.secret-key`) must be at least 256 bits (32 bytes), injected via external environment variables (`JWT_SECRET_KEY`) or secret stores, and never committed to source control.
2. **Payload Claims (`AZ-03`)**: Every JWT contains `sub` (`userId`), `email`, `accountType` (`COMPANY`, `FREELANCER`, `ADMIN`), `sessionId` (`user_sessions.id`), `iat`, and `exp` (`15 minutes`).
3. **Session Liveness Verification (`SYSTEM_ARCHITECTURE.md §8.3`)**: To mitigate the revocation delay of stateless JWTs upon immediate account deactivation or security breach, `JwtAuthenticationFilter` performs a fast Redis/DB check against `sessionId`. If the session is revoked or missing from `user_sessions` / Redis cache, the request is rejected with `401 Unauthorized` despite a mathematically valid JWT signature.
4. **Opaque Refresh Tokens (`AT-05`)**: Refresh tokens (`256-bit SecureRandom`) are never stored in plaintext. Only `SHA-256(refreshToken)` is stored in `user_sessions`. Every successful `/auth/refresh` invocation rotates the refresh token (deletes/replaces the old hash), preventing token replay attacks.

## Migration Path to RS256
When PactFlow introduces external microservices or a dedicated API Gateway (`SYSTEM_ARCHITECTURE.md §13` Scale Tier 3), `JwtService` will be updated to load an RSA private key (`RS256`) for signing and expose a public JSON Web Key Set (`/api/v1/auth/.well-known/jwks.json`). Because `JwtAuthenticationFilter` abstracts token verification and all claims (`sub`, `accountType`, `sessionId`) remain unchanged, downstream consumers and controllers will require zero modification during the `RS256` transition.

## Consequences
- **Positive**: Low computational overhead on the API server; straightforward configuration (`JWT_SECRET_KEY`); immediate revocation support via `sessionId` liveness check.
- **Negative**: The secret key must be securely protected across all API container instances.
