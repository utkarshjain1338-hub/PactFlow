package com.pactflow.application.escrow.port;

public record ContractDeploymentResult(
        String contractId,
        String network,
        Long ledger,
        String deploymentHash
) {
}
