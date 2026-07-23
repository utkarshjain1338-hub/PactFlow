package com.pactflow.domain.escrow;

public enum EscrowStatus {
    CREATED,
    PENDING_FUNDING,
    FUNDED,
    SUBMITTED,
    UNDER_REVIEW,
    APPROVED,
    RELEASED,
    REFUNDED,
    DISPUTED,
    FAILED
}
