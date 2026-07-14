package com.pactflow.infrastructure.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Custom business metrics configuration.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §12.4 (Custom Metrics).
 *
 * <p>Metric naming follows Micrometer conventions (dot-separated, lowercase).
 * All metrics tagged with {@code application} and {@code environment} globally.
 *
 * <p>Metrics registered:
 * <ul>
 *   <li>{@code pactflow.escrow.funded.count} — Counter</li>
 *   <li>{@code pactflow.payment.released.total_xlm} — Gauge</li>
 *   <li>{@code pactflow.ingestion.lag.ledgers} — Gauge</li>
 *   <li>{@code pactflow.milestone.state_transition.errors} — Counter</li>
 *   <li>{@code pactflow.outbox.pending.count} — Gauge</li>
 *   <li>{@code pactflow.db.pool.utilization} — Provided by HikariCP auto-config</li>
 * </ul>
 */
@Configuration
public class MetricsConfig {

    private final MeterRegistry meterRegistry;

    // Gauge backing fields — updated by ingestion daemon and outbox processor
    private final AtomicLong ingestionLagLedgers = new AtomicLong(0L);
    private final AtomicLong outboxPendingCount = new AtomicLong(0L);
    private final AtomicLong paymentReleasedTotalXlmMillionths = new AtomicLong(0L);

    /**
     * Constructs the metrics configuration with the Micrometer registry.
     *
     * @param meterRegistry the Micrometer MeterRegistry (auto-configured by Spring Boot Actuator)
     */
    public MetricsConfig(final MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * Registers all PactFlow custom metrics at application startup.
     */
    @PostConstruct
    public void registerMetrics() {
        // ─── Counters ─────────────────────────────────────────────────────

        // Total number of escrows funded (incremented by EscrowFundedHandler)
        Counter.builder("pactflow.escrow.funded.count")
                .description("Total number of escrow contracts funded via on-chain events")
                .tag("source", "ingestion_daemon")
                .register(meterRegistry);

        // Total milestone state transition errors (incremented on InvalidStateTransitionException)
        Counter.builder("pactflow.milestone.state_transition.errors")
                .description("Number of invalid milestone state transition attempts")
                .register(meterRegistry);

        // ─── Gauges ──────────────────────────────────────────────────────

        // Ingestion daemon ledger lag — distance behind current network tip
        Gauge.builder("pactflow.ingestion.lag.ledgers", ingestionLagLedgers, AtomicLong::doubleValue)
                .description("Number of ledgers the ingestion daemon is behind the current network tip")
                .tag("daemon", "soroban_ingestion")
                .register(meterRegistry);

        // Outbox events pending processing — backlog indicator
        Gauge.builder("pactflow.outbox.pending.count", outboxPendingCount, AtomicLong::doubleValue)
                .description("Number of outbox events with status PENDING awaiting processing")
                .register(meterRegistry);

        // Total XLM released across all milestones (stored as millionths to avoid floating point)
        Gauge.builder("pactflow.payment.released.total_xlm",
                        paymentReleasedTotalXlmMillionths,
                        v -> v.doubleValue() / 10_000_000.0)
                .description("Total XLM released to freelancers via milestone approvals (cumulative)")
                .baseUnit("XLM")
                .register(meterRegistry);
    }

    /**
     * Updates the ingestion daemon ledger lag gauge.
     * Called by {@code SorobanIngestionWorker} on each poll cycle.
     *
     * @param lagLedgers current ledger lag count
     */
    public void updateIngestionLag(final long lagLedgers) {
        ingestionLagLedgers.set(lagLedgers);
    }

    /**
     * Updates the outbox pending count gauge.
     * Called by the outbox processor after each processing cycle.
     *
     * @param pendingCount current count of PENDING outbox events
     */
    public void updateOutboxPendingCount(final long pendingCount) {
        outboxPendingCount.set(pendingCount);
    }

    /**
     * Adds to the total XLM released gauge.
     * Called by MilestoneReleasedHandler on PaymentReleased events.
     *
     * @param amountXlmMillionths amount in Stellar millionths (1 XLM = 10_000_000 stroops)
     */
    public void addPaymentReleased(final long amountXlmMillionths) {
        paymentReleasedTotalXlmMillionths.addAndGet(amountXlmMillionths);
    }
}
