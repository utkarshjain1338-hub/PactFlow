# PactFlow

**Constellation of Trust** — A blockchain-backed, milestone-based escrow platform for freelance collaboration built on **Spring Boot 3 (Java 21)**, **Next.js 15 (TypeScript)**, and **Stellar Soroban**.

---

## Architecture Overview

- **Frontend (`/frontend`)**: Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide Icons, and Storytelling Motion UI.
- **Backend (`/backend`)**: Java 21, Spring Boot 3.3.2, Clean Architecture, Flyway V1–V14, PostgreSQL 16, and Redis 7.
- **Smart Contracts (`/contracts`)**: Rust / Soroban smart contracts on Stellar Testnet (coming in Milestone 2).

---

## Quick Start (Local Development)

You can run the full application stack (Frontend + Backend + Infrastructure) easily using our automated launcher script or in separate terminal tabs.

### Prerequisites
- **Java 21** (or use our downloaded JDK 21 at `~/.jdk/jdk-21.0.11+10`)
- **Node.js 20+** and `npm`
- **Docker & Docker Compose** (for PostgreSQL 16, Redis 7, and MailHog)

---

### Option 1: One-Click Launcher (`start-dev.sh`)

We have provided a unified startup script in the project root:

```bash
./start-dev.sh
```

This automatically:
1. Starts **PostgreSQL 16**, **Redis 7**, and **MailHog** via `docker-compose up -d`.
2. Sets up `JAVA_HOME` and launches the **Spring Boot API Server** in the background (`http://localhost:8080`).
3. Starts the **Next.js Frontend dev server** (`http://localhost:3000`).

Press `Ctrl+C` at any time to shut down both servers cleanly.

---

### Option 2: Running in Separate Terminal Tabs (Recommended for Debugging)

If you prefer hot-reloading and independent terminal logs for each service, run them across 3 separate terminal tabs:

#### Tab 1: Start Infrastructure Containers
```bash
docker-compose up -d postgres redis mailhog
```

#### Tab 2: Start Spring Boot Backend API (Port 8080 / 8081)
```bash
# Set JAVA_HOME if using our local Eclipse Temurin JDK 21
export JAVA_HOME=$HOME/.jdk/jdk-21.0.11+10
export PATH=$JAVA_HOME/bin:$PATH

cd backend
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### Tab 3: Start Next.js Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

### Option 3: Full Docker Compose Stack (All-in-One Containerized)

To run the entire backend (`PostgreSQL`, `Redis`, `MailHog`, and `Spring Boot API Server`) inside Docker without needing local Java installed:

```bash
docker-compose --profile full up --build -d
```
Then start the frontend locally:
```bash
cd frontend && npm run dev
```

---

## Service Endpoints & Ports

| Service | Local URL / Port | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | Next.js 15 User Interface & Landing Page |
| **Backend API Server** | `http://localhost:8080` | Spring Boot REST API |
| **API Liveness Probe** | `http://localhost:8080/api/v1/health/liveness` | Public Liveness Probe |
| **API Readiness Probe** | `http://localhost:8080/api/v1/health/readiness` | Public Readiness Probe (DB + Redis Check) |
| **Swagger UI / OpenAPI**| `http://localhost:8080/swagger-ui.html` | Interactive API Documentation |
| **Actuator Management**| `http://localhost:8081/actuator` | Spring Boot Actuator Management Endpoints |
| **MailHog UI** | `http://localhost:8025` | Local Email Catch & Preview UI (`SMTP: 1025`) |
| **PostgreSQL 16** | `localhost:5432` | Database (`user: pactflow_app`, `pass: pactflow_dev_secret`) |
| **Redis 7** | `localhost:6379` | Cache & Rate Limit Storage |

---

## Verification & Testing

To run the automated test suite and Checkstyle validation for the backend:

```bash
export JAVA_HOME=$HOME/.jdk/jdk-21.0.11+10
export PATH=$JAVA_HOME/bin:$PATH

cd backend
./gradlew checkstyleMain test
```