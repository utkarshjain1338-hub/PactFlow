package com.pactflow.infrastructure.soroban;

import org.junit.jupiter.api.Test;
import org.stellar.sdk.responses.sorobanrpc.GetTransactionResponse;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class SorobanTest {
    @Test
    public void testEnum() {
        assertEquals("NOT_FOUND", GetTransactionResponse.GetTransactionStatus.NOT_FOUND.toString());
    }
}
