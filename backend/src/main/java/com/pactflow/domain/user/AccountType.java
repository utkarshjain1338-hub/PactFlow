package com.pactflow.domain.user;

/**
 * Account type classification for PactFlow users.
 *
 * <p>Authority: DOMAIN_MODEL.md §2 (Identity Aggregates), API_SPECIFICATION.md Domain 1.
 *
 * <p>Note: Once assigned during registration or admin provisioning, a user's account type
 * is immutable for the lifecycle of that user record.
 */
public enum AccountType {
    /** Client organization or individual hiring freelancers and funding escrows. */
    COMPANY,

    /** Independent contractor delivering project milestones and receiving escrow payouts. */
    FREELANCER,

    /** Platform administrator with operational supervision capabilities. */
    ADMIN;

    /**
     * Checks if this account type represents an administrator.
     *
     * @return true if this account type is ADMIN
     */
    public boolean isAdmin() {
        return this == ADMIN;
    }

    /**
     * Checks if this account type represents a client company.
     *
     * @return true if this account type is COMPANY
     */
    public boolean isCompany() {
        return this == COMPANY;
    }

    /**
     * Checks if this account type represents a freelancer.
     *
     * @return true if this account type is FREELANCER
     */
    public boolean isFreelancer() {
        return this == FREELANCER;
    }
}
