package com.pactflow.application.wallet.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = StellarPublicKeyValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidStellarPublicKey {
    /**
     * Default message.
     * @return message
     */
    String message() default "Invalid Stellar public key format or checksum";

    /**
     * Groups.
     * @return groups
     */
    Class<?>[] groups() default {};

    /**
     * Payload.
     * @return payload
     */
    Class<? extends Payload>[] payload() default {};
}
