package com.pactflow.infrastructure.cache;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration for PactFlow caching layers.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §7.6 (Caching Architecture):
 * <ul>
 *   <li>L1 — Session store: {@code session:{token_hash}} TTL 15 min</li>
 *   <li>L2 — Rate limit counters: {@code ratelimit:{user_id}:{window}} TTL 1 min</li>
 *   <li>L3 — Wallet challenge nonces: {@code walletchallenge:{public_key}} TTL 5 min</li>
 *   <li>L4 — Analytics snapshots (future): {@code analytics:platform:{date}} TTL 1 hour</li>
 * </ul>
 *
 * <p>Connection managed by Spring Data Redis Lettuce client (reactive-capable,
 * thread-safe, non-blocking). AUTH configured via {@code spring.data.redis.password}.
 */
@Configuration
public class RedisConfig {

    /**
     * RedisTemplate for String-to-String operations.
     *
     * <p>Used for:
     * <ul>
     *   <li>Wallet challenge nonces ({@code walletchallenge:{publicKey}})</li>
     *   <li>Session tokens ({@code session:{sessionId}})</li>
     *   <li>Rate limit keys ({@code ratelimit:{userId}:{window}})</li>
     * </ul>
     *
     * <p>Uses StringRedisSerializer on both key and value to prevent
     * Java serialization format in Redis — values are always human-readable strings.
     *
     * @param connectionFactory the Lettuce connection factory (auto-configured by Spring)
     * @return configured RedisTemplate
     */
    @Bean
    public RedisTemplate<String, String> redisTemplate(
            final RedisConnectionFactory connectionFactory) {
        final RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        final StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.setDefaultSerializer(stringSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
