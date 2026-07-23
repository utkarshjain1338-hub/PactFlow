package com.pactflow.application.escrow.port;

import com.pactflow.domain.escrow.Escrow;

public interface EscrowContractGateway {
    ContractDeploymentResult deployEscrow(Escrow escrow);
    UnsignedTransaction buildFundingTransaction(Escrow escrow);
    UnsignedTransaction buildReleaseTransaction(Escrow escrow);
    UnsignedTransaction buildRefundTransaction(Escrow escrow);
    ContractState fetchState(String contractId);
}
