package com.pactflow.application.wallet.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.stellar.sdk.KeyPair;

public class StellarPublicKeyValidator implements ConstraintValidator<ValidStellarPublicKey, String> {

    @Override
    public boolean isValid(final String value, final ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return false; // Let @NotBlank handle the message if it's completely empty
        }

        try {
            // Using the official Stellar SDK to validate the account ID format and checksum
            KeyPair.fromAccountId(value);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
