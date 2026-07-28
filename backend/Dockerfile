# =============================================================================
# PactFlow Backend — Multi-Stage Dockerfile
# Authority: SYSTEM_ARCHITECTURE.md §13.2 (Docker Architecture)
#
# Stage 1 (builder): JDK 21 + Gradle — compiles and packages the JAR
# Stage 2 (runtime): JRE 21 minimal — runs the packaged application
#
# Image size: ~200MB runtime layer (vs 600MB full JDK)
# =============================================================================

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

LABEL stage=builder

WORKDIR /build

# Copy Gradle wrapper and build files first (better layer caching)
COPY gradle/ gradle/
COPY gradlew settings.gradle build.gradle ./

# Pre-download Gradle dependencies (cached when source code changes but build.gradle doesn't)
RUN ./gradlew dependencies --no-daemon --quiet 2>/dev/null || true

# Copy source code
COPY src/ src/
COPY checkstyle/ checkstyle/

# Build the application (skip tests — tests run in CI, not Docker build)
RUN ./gradlew bootJar --no-daemon -x test -x checkstyleMain

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: run as non-root user
# SECURITY_THREAT_MODEL.md: principle of least privilege
RUN addgroup -g 1001 -S pactflow && \
    adduser -u 1001 -S pactflow -G pactflow

LABEL maintainer="PactFlow Engineering <engineering@pactflow.io>"
LABEL version="1.0.0"
LABEL description="PactFlow API Server — milestone-based escrow platform"

WORKDIR /app

# Copy packaged JAR from builder stage
COPY --from=builder --chown=pactflow:pactflow /build/build/libs/pactflow-backend.jar app.jar

# Switch to non-root user
USER pactflow

# Expose API port and management port
EXPOSE 8080
EXPOSE 8081

# JVM tuning for containers:
# - UseContainerSupport: respect Docker CPU/memory limits (JDK 8u191+ default)
# - MaxRAMPercentage: use up to 75% of container memory for heap
# - Virtual threads: enabled via spring.threads.virtual.enabled=true (no JVM flag needed)
# - G1GC: default in JDK 21, optimal for most workloads
# - ExitOnOutOfMemoryError: fail-fast on OOM rather than thrashing
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom \
    -Dfile.encoding=UTF-8"

# Health probe for Railway / Kubernetes
# SYSTEM_ARCHITECTURE.md §12.7: "Liveness: GET /actuator/health/liveness → 200"
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD wget -qO- http://localhost:8081/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
