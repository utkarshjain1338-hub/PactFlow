package com.pactflow.unit.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pactflow.infrastructure.config.PactFlowProperties;
import com.pactflow.infrastructure.web.security.RateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RateLimitFilter unit tests covering Bucket4j rate limits")
class RateLimitFilterTest {

    private RateLimitFilter filter;
    private PactFlowProperties properties;

    @BeforeEach
    void setUp() {
        properties = new PactFlowProperties();
        properties.getSecurity().getRateLimit().setAuthEndpointsRpm(10);
        properties.getSecurity().getRateLimit().setForgotPasswordRph(3);

        final ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        filter = new RateLimitFilter(properties, objectMapper);
    }

    @Test
    @DisplayName("Should allow requests within limit and set X-RateLimit headers")
    void shouldAllowRequestsWithinLimit() throws Exception {
        final MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        req.setRemoteAddr("192.168.1.100");
        final MockHttpServletResponse res = new MockHttpServletResponse();
        final MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(200);
        assertThat(res.getHeader("X-RateLimit-Limit")).isEqualTo("10");
        assertThat(res.getHeader("X-RateLimit-Remaining")).isEqualTo("9");
    }

    @Test
    @DisplayName("Should return 429 RFC 7807 ProblemDetail when general auth rate limit is exceeded")
    void shouldReturn429WhenAuthLimitExceeded() throws Exception {
        final String ip = "192.168.1.200";
        for (int i = 0; i < 10; i++) {
            final MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr(ip);
            filter.doFilter(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        // 11th request breaches the 10 rpm limit
        final MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        blockedReq.setRemoteAddr(ip);
        final MockHttpServletResponse blockedRes = new MockHttpServletResponse();

        filter.doFilter(blockedReq, blockedRes, new MockFilterChain());

        assertThat(blockedRes.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        assertThat(blockedRes.getContentType()).isEqualTo(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        assertThat(blockedRes.getHeader("Retry-After")).isNotNull();
        assertThat(blockedRes.getContentAsString()).contains("Rate limit exceeded").contains("TOO_MANY_REQUESTS");
    }

    @Test
    @DisplayName("Should enforce strict 3 req/hour rate limit on /api/v1/auth/forgot-password")
    void shouldEnforce3PerHourLimitOnForgotPassword() throws Exception {
        final String ip = "10.0.0.50";
        for (int i = 0; i < 3; i++) {
            final MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/forgot-password");
            req.setRemoteAddr(ip);
            filter.doFilter(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        // 4th request breaches the 3 rph limit
        final MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/v1/auth/forgot-password");
        blockedReq.setRemoteAddr(ip);
        final MockHttpServletResponse blockedRes = new MockHttpServletResponse();

        filter.doFilter(blockedReq, blockedRes, new MockFilterChain());

        assertThat(blockedRes.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        assertThat(blockedRes.getContentType()).isEqualTo(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        assertThat(blockedRes.getHeader("X-RateLimit-Limit")).isEqualTo("3");
        assertThat(blockedRes.getHeader("X-RateLimit-Remaining")).isEqualTo("0");
    }

    @Test
    @DisplayName("Should enforce mutation rate limits (60/min) on /api/v1/users/me PATCH")
    void shouldEnforceUserMutationRateLimit() throws Exception {
        final MockHttpServletRequest req = new MockHttpServletRequest("PATCH", "/api/v1/users/me");
        req.setRemoteAddr("10.1.1.1");
        final MockHttpServletResponse res = new MockHttpServletResponse();

        filter.doFilter(req, res, new MockFilterChain());

        assertThat(res.getStatus()).isEqualTo(200);
        assertThat(res.getHeader("X-RateLimit-Limit")).isEqualTo("60");
        assertThat(res.getHeader("X-RateLimit-Remaining")).isEqualTo("59");
    }

    @Test
    @DisplayName("Should enforce global read rate limits (300/min) on /api/v1/users/me GET")
    void shouldEnforceUserReadRateLimit() throws Exception {
        final MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/users/me");
        req.setRemoteAddr("10.1.1.2");
        final MockHttpServletResponse res = new MockHttpServletResponse();

        filter.doFilter(req, res, new MockFilterChain());

        assertThat(res.getStatus()).isEqualTo(200);
        assertThat(res.getHeader("X-RateLimit-Limit")).isEqualTo("300");
        assertThat(res.getHeader("X-RateLimit-Remaining")).isEqualTo("299");
    }
}
