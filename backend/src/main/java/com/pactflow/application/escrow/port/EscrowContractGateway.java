package com.pactflow.application.escrow.port;

import com.pactflow.domain.escrow.Escrow;

public interface EscrowContractGateway {
    ContractDeploymentResult deployEscrow(Escrow escrow);
    UnsignedTransaction buildFundingTransaction(Escrow escrow, String sourceAccountAddress);
    UnsignedTransaction buildReleaseTransaction(Escrow escrow, String sourceAccountAddress);
    UnsignedTransaction buildRefundTransaction(Escrow escrow, String sourceAccountAddress);
    ContractState fetchState(String contractId);
}
