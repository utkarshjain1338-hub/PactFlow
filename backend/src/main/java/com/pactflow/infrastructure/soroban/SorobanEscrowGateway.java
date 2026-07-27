package com.pactflow.infrastructure.soroban;

import com.pactflow.application.escrow.port.ContractDeploymentResult;
import com.pactflow.application.escrow.port.ContractState;
import com.pactflow.application.escrow.port.EscrowContractGateway;
import com.pactflow.application.escrow.port.UnsignedTransaction;
import com.pactflow.domain.escrow.Escrow;
import com.pactflow.infrastructure.config.PactFlowProperties;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import org.stellar.sdk.AbstractTransaction;
import org.stellar.sdk.Network;
import org.stellar.sdk.SorobanServer;
import org.stellar.sdk.Transaction;
import org.stellar.sdk.TransactionBuilder;
import org.stellar.sdk.operations.InvokeHostFunctionOperation;
import org.stellar.sdk.responses.sorobanrpc.SendTransactionResponse;
import org.stellar.sdk.responses.sorobanrpc.SimulateTransactionResponse;
import org.stellar.sdk.scval.Scv;
import org.stellar.sdk.xdr.SCVal;

import java.math.BigInteger;
import java.util.Collection;
import java.util.List;

/**
 * Implements the EscrowContractGateway using the Stellar SDK.
 * This class is strictly responsible for generating XDRs and reading contract state.
 * It contains NO business logic.
 */
@Component
public class SorobanEscrowGateway implements EscrowContractGateway {

    private final String network;
    private final String networkPassphrase;
    private final String rpcUrl;
    private final String contractId;
    private final String xlmTokenId;
    private final SorobanServer sorobanServer;

    public SorobanEscrowGateway(PactFlowProperties properties) {
        this.network = properties.getStellar().getNetwork();
        this.networkPassphrase = properties.getStellar().getNetworkPassphrase();
        this.rpcUrl = properties.getStellar().getSorobanRpcUrl();
        this.contractId = properties.getStellar().getContractId();
        this.xlmTokenId = properties.getStellar().getXlmTokenId();
        this.sorobanServer = new SorobanServer(this.rpcUrl);
    }

    @Override
    public ContractDeploymentResult deployEscrow(Escrow escrow) {
        ensureContractConfigured();
        return new ContractDeploymentResult(
                contractId,
                network,
                latestLedgerSequence(),
                contractId
        );
    }

    @Override
    public UnsignedTransaction buildFundingTransaction(Escrow escrow, String sourceAccountAddress) {
        return buildInvokeTransaction(sourceAccountAddress, "deposit", List.of(), "FUND");
    }

    @Override
    public UnsignedTransaction buildReleaseTransaction(Escrow escrow, String sourceAccountAddress) {
        return buildInvokeTransaction(sourceAccountAddress, "approveMilestone", List.of(Scv.toUint32(0)), "RELEASE");
    }

    /**
     * Builds the initialize() transaction for the Soroban escrow contract.
     * Must be signed and broadcast before deposit() can be called.
     *
     * @param clientAddress     Stellar public key of the client
     * @param freelancerAddress Stellar public key of the freelancer  
     * @param amountXlm        Total escrow amount in XLM
     * @param milestonesTotal  Number of milestones
     * @param sourceAddress    Account paying the transaction fee (client)
     */
    public UnsignedTransaction buildInitializationTransaction(
            String clientAddress,
            String freelancerAddress,
            java.math.BigDecimal amountXlm,
            int milestonesTotal,
            String sourceAddress) {
        ensureContractConfigured();

        // Convert XLM to stroops (1 XLM = 10,000,000 stroops) as i128 BigInteger
        BigInteger amountStroops = amountXlm
                .multiply(java.math.BigDecimal.valueOf(10_000_000L))
                .toBigIntegerExact();

        List<SCVal> params = List.of(
                Scv.toAddress(clientAddress),
                Scv.toAddress(freelancerAddress),
                Scv.toAddress(xlmTokenId),
                Scv.toInt128(amountStroops),
                Scv.toUint32(milestonesTotal)
        );

        return buildInvokeTransaction(sourceAddress, "initialize", params, "INITIALIZE");
    }

    @Override
    public UnsignedTransaction buildRefundTransaction(Escrow escrow, String sourceAccountAddress) {
        return buildInvokeTransaction(sourceAccountAddress, "refund", List.of(), "REFUND");
    }

    /**
     * Submits a signed XDR transaction to the Stellar network and returns the transaction hash.
     * Called by the TransactionController after the user has signed the XDR in Freighter.
     *
     * @param signedXdr the base64-encoded signed transaction XDR
     * @return the transaction hash from the network
     */
    public String broadcastTransaction(String signedXdr) {
        Transaction transaction = (Transaction) AbstractTransaction.fromEnvelopeXdr(signedXdr, new Network(networkPassphrase));
        SendTransactionResponse response = sorobanServer.sendTransaction(transaction);

        if (response.getStatus().equals("ERROR") || (response.getStatus().equals("DUPLICATE") && response.getHash() == null)) {
            throw new IllegalStateException("Soroban network rejected transaction. Status: " + response.getStatus()
                    + ", Error: " + response.getErrorResultXdr());
        }

        return response.getHash();
    }

    @Override
    public ContractState fetchState(String contractId) {
        if (contractId == null || contractId.isBlank()) {
            throw new IllegalArgumentException("contractId cannot be blank");
        }

        return new ContractState(
                "UNKNOWN",
                0L,
                latestLedgerSequence()
        );
    }

    @PreDestroy
    public void close() {
        try {
            sorobanServer.close();
        } catch (Exception ignored) {}
    }

    private UnsignedTransaction buildInvokeTransaction(
            String sourceAccountAddress,
            String functionName,
            Collection<SCVal> parameters,
            String operation) {
        ensureContractConfigured();

        Transaction transaction = new TransactionBuilder(
                sorobanServer.getAccount(sourceAccountAddress),
                new Network(networkPassphrase))
                .addOperation(InvokeHostFunctionOperation.invokeContractFunctionOperationBuilder(
                        contractId,
                        functionName,
                        parameters)
                        .build())
                .setBaseFee(100L)
                .setTimeout(BigInteger.valueOf(300L))
                .build();

        // Simulate the transaction to get the resource footprint so Freighter can sign it
        SimulateTransactionResponse simulation;
        Transaction preparedTransaction;
        
        try {
            simulation = sorobanServer.simulateTransaction(transaction);
            
            if (simulation.getError() != null) {
                String err = simulation.getError().isBlank() ? "Unknown contract error" : simulation.getError();
                throw new IllegalStateException("Soroban simulation failed [" + functionName + "]: " + err);
            }

            preparedTransaction = sorobanServer.prepareTransaction(transaction, simulation);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to simulate Soroban transaction [" + functionName + "]: " + e.getMessage(), e);
        }

        return new UnsignedTransaction(
                preparedTransaction.toEnvelopeXdrBase64(),
                networkPassphrase,
                preparedTransaction.getFee(),
                simulation.getLatestLedger() == null ? latestLedgerSequence() : simulation.getLatestLedger(),
                operation
        );
    }

    private void ensureContractConfigured() {
        if (contractId == null || contractId.isBlank()) {
            throw new IllegalStateException(
                    "PACTFLOW_CONTRACT_ID must be configured before building Soroban transactions.");
        }
    }

    private Long latestLedgerSequence() {
        return sorobanServer.getLatestLedger().getSequence().longValue();
    }
}
