package com.pactflow.application.wallet.dto;

import lombok.Builder;

@Builder
public record ChallengeResponse(
        String nonce,
        long expiresAtEpochSeconds
) {}
