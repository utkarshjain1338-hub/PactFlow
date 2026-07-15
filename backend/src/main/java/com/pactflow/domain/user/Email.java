package com.pactflow.domain.user;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Value object representing a validated, normalized user email address.
 *
 * <p>Authority: DOMAIN_MODEL.md §2 (Identity Aggregates), API_SPECIFICATION.md §POST /auth/register.
 *
 * <p>Enforces RFC 5322 format constraints, maximum length of 320 characters,
 * and canonical lowercase representation. Value objects are immutable.
 */
public final class Email {

    private static final int MAX_LENGTH = 320;
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    private final String value;

    /**
     * Constructs and validates an Email value object.
     *
     * @param rawEmail raw email string
     * @throws IllegalArgumentException if null, blank, too long, or malformed
     */
    public Email(final String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new IllegalArgumentException("Email cannot be null or blank.");
        }
        final String normalized = rawEmail.trim().toLowerCase();
        if (normalized.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "Email exceeds maximum allowed length of " + MAX_LENGTH + " characters.");
        }
        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Email address does not conform to required format constraints.");
        }
        this.value = normalized;
    }

    /**
     * Returns the normalized email string value.
     *
     * @return lowercase trimmed email string
     */
    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof Email other)) {
            return false;
        }
        return Objects.equals(value, other.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
