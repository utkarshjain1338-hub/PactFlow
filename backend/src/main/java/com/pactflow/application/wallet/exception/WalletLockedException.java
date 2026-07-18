package com.pactflow.application.wallet.exception;

import com.pactflow.infrastructure.web.exception.PactFlowException;

public class WalletLockedException extends PactFlowException {
    public WalletLockedException(final String message) {
        super(message);
    }
}
