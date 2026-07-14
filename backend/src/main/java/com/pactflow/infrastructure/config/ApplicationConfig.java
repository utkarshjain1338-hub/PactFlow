package com.pactflow.infrastructure.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Core application infrastructure configuration.
 *
 * <p>Configures:
 * <ul>
 *   <li>Virtual Threads executor for async operations (Java 21 — SYSTEM_ARCHITECTURE.md §5.1)</li>
 *   <li>Jackson ObjectMapper with ISO 8601 dates and camelCase (API_SPECIFICATION.md §1.2)</li>
 * </ul>
 *
 * <p>NOTE: Virtual Threads for HTTP request handling are enabled globally via
 * {@code spring.threads.virtual.enabled=true} in application.yml.
 * This bean provides a named VT executor for @Async tasks and scheduled work.
 */
@Configuration
@EnableAsync
public class ApplicationConfig {

    /**
     * Virtual Threads executor for @Async methods and scheduled tasks.
     *
     * <p>Uses Java 21 virtual threads per-task executor which creates a new
     * lightweight virtual thread for each submitted task. Per SYSTEM_ARCHITECTURE.md §5.1:
     * "Virtual Threads for I/O-bound paths."
     *
     * @return a virtual-thread-per-task executor
     */
    @Bean(name = "virtualThreadExecutor")
    public Executor virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * Primary Jackson ObjectMapper configured for PactFlow's API contract.
     *
     * <p>Per API_SPECIFICATION.md §1.2:
     * - Timestamps are ISO 8601 UTC (not epoch milliseconds)
     * - Response fields are camelCase
     * - Monetary amounts serialized with 7 decimal places (handled at DTO level)
     * - Null fields omitted (configured in application.yml: default-property-inclusion: non_null)
     *
     * @return configured ObjectMapper instance
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        final ObjectMapper mapper = new ObjectMapper();

        // Java 8+ Date/Time support (Instant, LocalDate, etc.)
        mapper.registerModule(new JavaTimeModule());

        // ISO 8601 timestamps — never epoch milliseconds
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS);

        // Tolerate unknown fields during deserialization — forward-compatible API
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.disable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE);

        // Sort properties alphabetically for deterministic output
        mapper.enable(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY);

        // Fail loudly on empty beans — catches accidental unserializable objects
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        return mapper;
    }
}
