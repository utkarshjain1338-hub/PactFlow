package com.pactflow.application.escrow.port;

public record UnsignedTransaction(
        String xdr,
        String networkPassphrase,
        Long fee,
        Long validUntilLedger,
        String operation
) {
}
