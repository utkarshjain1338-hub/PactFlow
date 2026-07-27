package com.pactflow.application.escrow.port;

public record UnsignedTransaction(
        String transactionXdr,
        String networkPassphrase,
        Long fee,
        Long validUntilLedger,
        String operation
) {
}
