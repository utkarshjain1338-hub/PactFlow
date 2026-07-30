#!/usr/bin/env bash
# =============================================================================
# PactFlow Local Development Launcher
# Starts infrastructure (PostgreSQL, Redis, MailHog), Spring Boot Backend, and Next.js Frontend
# =============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=============================================="
echo "      Starting PactFlow Dev Stack             "
echo "=============================================="


# 2. Check & Set JAVA_HOME for JDK 21
if [ -d "/home/uzumaki/.jdk/jdk-21.0.11+10" ]; then
    export JAVA_HOME="/home/uzumaki/.jdk/jdk-21.0.11+10"
    export PATH="$JAVA_HOME/bin:$PATH"
fi

# 3. Start Backend in background (or separate terminal prompt)
echo "[2/3] Building and starting Spring Boot Backend (port 8080)..."
cd "$ROOT_DIR/backend"
chmod +x gradlew
./gradlew bootRun --args='--spring.profiles.active=dev' &
BACKEND_PID=$!
echo "Backend running in background with PID $BACKEND_PID"

# 4. Start Frontend
echo "[3/3] Starting Next.js Frontend (port 3000)..."
cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "=============================================="
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080/api/v1/health/liveness"
echo "  Swagger:   http://localhost:8080/swagger-ui.html"
echo "  MailHog:   http://localhost:8025"
echo "=============================================="
echo "Press Ctrl+C to stop both servers."

# Trap Ctrl+C and kill both
trap "echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

npm run dev
