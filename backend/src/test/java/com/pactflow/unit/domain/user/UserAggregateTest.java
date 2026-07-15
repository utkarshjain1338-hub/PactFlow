package com.pactflow.unit.domain.user;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("User aggregate and Email value object domain logic")
class UserAggregateTest {

    @Test
    @DisplayName("Should create valid User aggregate with default flags and fields")
    void shouldCreateValidUserAggregate() {
        final UUID id = UUID.randomUUID();
        final Email email = new Email("alex@pactflow.io");
        final User user = new User(id, email, "hashedPassword123", AccountType.FREELANCER, "Alex Mercer", "America/New_York");

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmail().getValue()).isEqualTo("alex@pactflow.io");
        assertThat(user.getPasswordHash()).isEqualTo("hashedPassword123");
        assertThat(user.getAccountType()).isEqualTo(AccountType.FREELANCER);
        assertThat(user.getDisplayName()).isEqualTo("Alex Mercer");
        assertThat(user.getTimezone()).isEqualTo("America/New_York");
        assertThat(user.isEmailVerified()).isFalse();
        assertThat(user.isActive()).isTrue();
        assertThat(user.isDeleted()).isFalse();
        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should transition isEmailVerified to true when verifyEmail() is called")
    void shouldVerifyEmail() {
        final User user = new User(UUID.randomUUID(), new Email("test@pactflow.io"), "hash", AccountType.COMPANY, "Test Client", "UTC");
        assertThat(user.isEmailVerified()).isFalse();

        user.verifyEmail();
        assertThat(user.isEmailVerified()).isTrue();
    }

    @Test
    @DisplayName("Should update password hash when changePassword() is invoked")
    void shouldChangePassword() {
        final User user = new User(UUID.randomUUID(), new Email("test@pactflow.io"), "oldHash", AccountType.COMPANY, "Test Client", "UTC");
        assertThat(user.getPasswordHash()).isEqualTo("oldHash");

        user.changePassword("newHash");
        assertThat(user.getPasswordHash()).isEqualTo("newHash");
    }

    @Test
    @DisplayName("Should mark user as inactive when deactivate() is called")
    void shouldDeactivateUser() {
        final User user = new User(UUID.randomUUID(), new Email("test@pactflow.io"), "hash", AccountType.FREELANCER, "Freelancer", "UTC");
        assertThat(user.isActive()).isTrue();

        user.deactivate();
        assertThat(user.isActive()).isFalse();
    }

    @Test
    @DisplayName("Should soft delete user when softDelete() is called")
    void shouldSoftDeleteUser() {
        final User user = new User(UUID.randomUUID(), new Email("test@pactflow.io"), "hash", AccountType.COMPANY, "Client", "UTC");
        assertThat(user.isDeleted()).isFalse();
        assertThat(user.isActive()).isTrue();

        user.softDelete();
        assertThat(user.isDeleted()).isTrue();
        assertThat(user.isActive()).isFalse();
    }

    @Test
    @DisplayName("Email value object should normalize to lowercase and trim spaces")
    void shouldNormalizeEmail() {
        final Email email = new Email("   ALEX@pactflow.io   ");
        assertThat(email.getValue()).isEqualTo("alex@pactflow.io");
    }

    @Test
    @DisplayName("Email value object should reject null or blank strings")
    void shouldRejectNullOrBlankEmail() {
        assertThatThrownBy(() -> new Email(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("null or blank");

        assertThatThrownBy(() -> new Email("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("null or blank");
    }

    @Test
    @DisplayName("Email value object should reject malformed email strings")
    void shouldRejectMalformedEmail() {
        assertThatThrownBy(() -> new Email("invalid-email-no-at-sign.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("format constraints");
    }
}
