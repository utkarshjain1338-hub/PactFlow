package com.pactflow.infrastructure.mail;

import com.pactflow.infrastructure.config.PactFlowProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Real SMTP implementation of EmailService using JavaMailSender.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 1, PROJECT_CONSTITUTION.md Rule 7 (production-ready).
 * Sends formatted email messages using configurable from-address properties (`pactflow.mail.from-address`).
 */
@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private static final Logger LOG = LoggerFactory.getLogger(SmtpEmailService.class);
    private static final String APP_URL = "https://app.pactflow.io";

    private final JavaMailSender mailSender;
    private final PactFlowProperties properties;

    @Override
    public void sendVerificationEmail(final String toEmail, final String displayName, final String token) {
        LOG.info("Dispatching verification email to {} [token={}]", toEmail, token);
        try {
            final SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(properties.getMail().getFromAddress());
            message.setTo(toEmail);
            message.setSubject("Verify your PactFlow account email");
            message.setText(String.format(
                    "Hello %s,\n\n"
                    + "Welcome to PactFlow! Please verify your email address by using the verification token below:\n\n"
                    + "Verification Token: %s\n\n"
                    + "Or click this link: %s/auth/verify?token=%s\n\n"
                    + "This link will expire in 24 hours.\n\n"
                    + "Best regards,\nThe PactFlow Team",
                    displayName, token, APP_URL, token
            ));
            mailSender.send(message);
            LOG.info("Verification email successfully delivered to {}", toEmail);
        } catch (final Exception e) {
            LOG.error("Failed to deliver verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Override
    public void sendPasswordResetEmail(final String toEmail, final String displayName, final String token) {
        LOG.info("Dispatching password reset email to {} [token={}]", toEmail, token);
        try {
            final SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(properties.getMail().getFromAddress());
            message.setTo(toEmail);
            message.setSubject("Reset your PactFlow password");
            message.setText(String.format(
                    "Hello %s,\n\n"
                    + "We received a request to reset your PactFlow account password.\n\n"
                    + "Reset Token: %s\n\n"
                    + "Or click this link: %s/auth/reset?token=%s\n\n"
                    + "This link will expire in 1 hour. "
                    + "If you did not request this reset, please ignore this email.\n\n"
                    + "Best regards,\nThe PactFlow Team",
                    displayName, token, APP_URL, token
            ));
            mailSender.send(message);
            LOG.info("Password reset email successfully delivered to {}", toEmail);
        } catch (final Exception e) {
            LOG.error("Failed to deliver password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
