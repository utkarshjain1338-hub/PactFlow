package com.pactflow.application.escrow.port;

public record ContractState(
        String state,
        Long balance,
        Long lastUpdatedLedger
) {
}
