package com.pactflow.infrastructure.mail;

/**
 * Interface for transactional email dispatch.
 * Authority: API_SPECIFICATION.md Domain 1 (Registration & Password Reset flows).
 */
public interface EmailService {

    /**
     * Sends an email verification message containing a single-use verification token.
     *
     * @param toEmail     recipient email address
     * @param displayName recipient display name
     * @param token       single-use verification token (24-hour expiry)
     */
    void sendVerificationEmail(String toEmail, String displayName, String token);

    /**
     * Sends a password reset link containing a single-use reset token.
     *
     * @param toEmail     recipient email address
     * @param displayName recipient display name
     * @param token       single-use reset token (1-hour expiry)
     */
    void sendPasswordResetEmail(String toEmail, String displayName, String token);
}
