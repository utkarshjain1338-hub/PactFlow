#![no_std]
#![allow(non_snake_case, deprecated)]

#[cfg(test)]
extern crate std;

mod types;

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env};

pub use types::{
    EscrowCreatedEvent, EscrowData, EscrowError, EscrowStatus, EscrowView, FundsDepositedEvent,
    FundsReleasedEvent, MilestoneApprovedEvent, RefundIssuedEvent,
};

use types::DataKey;
const MAX_MILESTONES: u32 = 64;
const TTL_THRESHOLD: u32 = 100;
const TTL_EXTENSION: u32 = 1000;

#[contract]
pub struct PactFlowEscrow;

#[allow(non_snake_case)]
#[contractimpl]
impl PactFlowEscrow {
    /// Creates the escrow record once and records the parties, amount, token, and milestone count.
    pub fn initialize(
        env: Env,
        escrow_id: soroban_sdk::String,
        client: Address,
        freelancer: Address,
        token: Address,
        amount: i128,
        milestones_total: u32,
    ) -> Result<(), EscrowError> {
        if env.storage().persistent().has(&DataKey::Escrow(escrow_id.clone())) {
            return Err(EscrowError::AlreadyInitialized);
        }

        client.require_auth();
        Self::validate_parties(&client, &freelancer)?;
        Self::validate_amount(amount)?;
        Self::validate_milestones_total(milestones_total)?;

        let created_at = env.ledger().timestamp();
        let escrow = EscrowData {
            client: client.clone(),
            freelancer: freelancer.clone(),
            token: token.clone(),
            amount,
            status: EscrowStatus::Created,
            milestones_total,
            approved_bitmap: 0,
            created_at,
        };

        Self::save_escrow(&env, &escrow_id, &escrow);
        Self::bump_ttl(&env, &escrow_id);
        env.events().publish(
            (symbol_short!("pactflow"), symbol_short!("created")),
            EscrowCreatedEvent {
                client,
                freelancer,
                amount,
                milestones_total,
                created_at,
            },
        );

        Ok(())
    }

    /// Transfers the exact escrow amount from the client into the contract.
    pub fn deposit(env: Env, escrow_id: soroban_sdk::String) -> Result<(), EscrowError> {
        let mut escrow = Self::load_escrow(&env, &escrow_id)?;
        Self::ensure_status(&escrow, EscrowStatus::Created)?;
        escrow.client.require_auth();

        token::TokenClient::new(&env, &escrow.token).transfer(
            &escrow.client,
            &env.current_contract_address(),
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Funded;
        Self::save_escrow(&env, &escrow_id, &escrow);
        Self::bump_ttl(&env, &escrow_id);
        env.events().publish(
            (symbol_short!("pactflow"), symbol_short!("deposited")),
            FundsDepositedEvent {
                client: escrow.client,
                amount: escrow.amount,
            },
        );

        Ok(())
    }

    /// Marks one milestone as approved and releases the full escrow to the freelancer once all milestones are approved.
    pub fn approveMilestone(env: Env, escrow_id: soroban_sdk::String, milestone_index: u32) -> Result<(), EscrowError> {
        let mut escrow = Self::load_escrow(&env, &escrow_id)?;
        Self::ensure_status(&escrow, EscrowStatus::Funded)?;
        escrow.client.require_auth();

        Self::validate_milestone_index(&escrow, milestone_index)?;
        let mask = 1u64
            .checked_shl(milestone_index)
            .ok_or(EscrowError::InvalidMilestoneIndex)?;

        if escrow.approved_bitmap & mask != 0 {
            return Err(EscrowError::DuplicateOperation);
        }

        escrow.approved_bitmap |= mask;
        let approved_milestones = escrow.approved_bitmap.count_ones();

        env.events().publish(
            (symbol_short!("pactflow"), symbol_short!("approved")),
            MilestoneApprovedEvent {
                milestone_index,
                approved_milestones,
            },
        );

        if approved_milestones == escrow.milestones_total {
            token::TokenClient::new(&env, &escrow.token).transfer(
                &env.current_contract_address(),
                &escrow.freelancer,
                &escrow.amount,
            );

            escrow.status = EscrowStatus::Released;
            Self::save_escrow(&env, &escrow_id, &escrow);
            Self::bump_ttl(&env, &escrow_id);
            env.events().publish(
                (symbol_short!("pactflow"), symbol_short!("released")),
                FundsReleasedEvent {
                    freelancer: escrow.freelancer,
                    amount: escrow.amount,
                },
            );
            return Ok(());
        }

        Self::save_escrow(&env, &escrow_id, &escrow);
        Self::bump_ttl(&env, &escrow_id);
        Ok(())
    }

    /// Returns the full escrow snapshot to any caller.
    pub fn getEscrow(env: Env, escrow_id: soroban_sdk::String) -> Result<EscrowView, EscrowError> {
        let escrow = Self::load_escrow(&env, &escrow_id)?;
        Ok(EscrowView {
            client: escrow.client,
            freelancer: escrow.freelancer,
            token: escrow.token,
            amount: escrow.amount,
            status: escrow.status,
            milestones_total: escrow.milestones_total,
            approved_milestones: escrow.approved_bitmap.count_ones(),
            created_at: escrow.created_at,
        })
    }

    /// Returns the full escrow amount to the client and marks the escrow as refunded.
    pub fn refund(env: Env, escrow_id: soroban_sdk::String) -> Result<(), EscrowError> {
        let mut escrow = Self::load_escrow(&env, &escrow_id)?;
        Self::ensure_status(&escrow, EscrowStatus::Funded)?;
        escrow.client.require_auth();

        token::TokenClient::new(&env, &escrow.token).transfer(
            &env.current_contract_address(),
            &escrow.client,
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Refunded;
        Self::save_escrow(&env, &escrow_id, &escrow);
        Self::bump_ttl(&env, &escrow_id);
        env.events().publish(
            (symbol_short!("pactflow"), symbol_short!("refunded")),
            RefundIssuedEvent {
                client: escrow.client,
                amount: escrow.amount,
            },
        );

        Ok(())
    }

    /// Cancels the escrow before any deposit is made and marks it as cancelled.
    pub fn cancel(env: Env, escrow_id: soroban_sdk::String) -> Result<(), EscrowError> {
        let mut escrow = Self::load_escrow(&env, &escrow_id)?;
        Self::ensure_status(&escrow, EscrowStatus::Created)?;
        escrow.client.require_auth();

        escrow.status = EscrowStatus::Cancelled;
        Self::save_escrow(&env, &escrow_id, &escrow);
        Self::bump_ttl(&env, &escrow_id);
        Ok(())
    }

    fn load_escrow(env: &Env, escrow_id: &soroban_sdk::String) -> Result<EscrowData, EscrowError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(EscrowError::NotInitialized)
    }

    fn save_escrow(env: &Env, escrow_id: &soroban_sdk::String, escrow: &EscrowData) {
        env.storage().persistent().set(&DataKey::Escrow(escrow_id.clone()), escrow);
    }

    fn bump_ttl(env: &Env, escrow_id: &soroban_sdk::String) {
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Escrow(escrow_id.clone()), TTL_THRESHOLD, TTL_EXTENSION);
    }

    fn ensure_status(escrow: &EscrowData, expected: EscrowStatus) -> Result<(), EscrowError> {
        if escrow.status != expected {
            return Err(EscrowError::InvalidState);
        }
        Ok(())
    }

    fn validate_parties(client: &Address, freelancer: &Address) -> Result<(), EscrowError> {
        if client == freelancer {
            return Err(EscrowError::InvalidState);
        }
        Ok(())
    }

    fn validate_amount(amount: i128) -> Result<(), EscrowError> {
        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        Ok(())
    }

    fn validate_milestones_total(milestones_total: u32) -> Result<(), EscrowError> {
        if milestones_total == 0 || milestones_total > MAX_MILESTONES {
            return Err(EscrowError::InvalidMilestoneIndex);
        }
        Ok(())
    }

    fn validate_milestone_index(escrow: &EscrowData, milestone_index: u32) -> Result<(), EscrowError> {
        if milestone_index >= escrow.milestones_total || milestone_index >= MAX_MILESTONES {
            return Err(EscrowError::InvalidMilestoneIndex);
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, token, Env};

    fn make_addresses(env: &Env) -> (Address, Address, Address) {
        let client = Address::generate(env);
        let freelancer = Address::generate(env);
        let token = Address::generate(env);
        (client, freelancer, token)
    }

    #[test]
    fn initialize_deposit_and_release_happy_path() {
        let env = Env::default();
        env.mock_all_auths();

        let (client, freelancer, _token_seed) = make_addresses(&env);
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let token_id = token_contract.address();
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
        let token_client = token::TokenClient::new(&env, &token_id);
        token_admin_client.mint(&client, &1_000_000i128);

        let contract_id = env.register(PactFlowEscrow, ());
        let client_contract = PactFlowEscrowClient::new(&env, &contract_id);

        assert_eq!(
            client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &1_000_000i128, &2u32),
            Ok(Ok(()))
        );

        let created = client_contract.try_getEscrow(&soroban_sdk::String::from_str(&env, "proj_1")).unwrap().unwrap();
        assert_eq!(created.status, EscrowStatus::Created);
        assert_eq!(created.milestones_total, 2);

        assert_eq!(token_client.balance(&client), 1_000_000i128);
        assert_eq!(client_contract.try_deposit(&soroban_sdk::String::from_str(&env, "proj_1")), Ok(Ok(())));
        assert_eq!(token_client.balance(&client), 0);
        assert_eq!(token_client.balance(&contract_id), 1_000_000i128);
        assert_eq!(client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &0u32), Ok(Ok(())));
        assert_eq!(client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &1u32), Ok(Ok(())));

        let escrow = client_contract.try_getEscrow(&soroban_sdk::String::from_str(&env, "proj_1")).unwrap().unwrap();
        assert_eq!(escrow.status, EscrowStatus::Released);
        assert_eq!(escrow.approved_milestones, 2);
        assert_eq!(token_client.balance(&contract_id), 0);
        assert_eq!(token_client.balance(&freelancer), 1_000_000i128);
    }

    #[test]
    fn cannot_initialize_twice() {
        let env = Env::default();
        env.mock_all_auths();

        let (client, freelancer, _token_seed) = make_addresses(&env);
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let token_id = token_contract.address();
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&client, &100i128);

        let contract_id = env.register(PactFlowEscrow, ());
        let client_contract = PactFlowEscrowClient::new(&env, &contract_id);

        assert_eq!(client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &100i128, &1u32), Ok(Ok(())));
        assert_eq!(client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &100i128, &1u32), Err(Ok(EscrowError::AlreadyInitialized)));
    }

    #[test]
    fn wrong_state_transitions_fail() {
        let env = Env::default();
        env.mock_all_auths();

        let (client, freelancer, _token_seed) = make_addresses(&env);
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let token_id = token_contract.address();
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&client, &100i128);

        let contract_id = env.register(PactFlowEscrow, ());
        let client_contract = PactFlowEscrowClient::new(&env, &contract_id);

        assert_eq!(client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &100i128, &1u32), Ok(Ok(())));
        assert_eq!(client_contract.try_cancel(&soroban_sdk::String::from_str(&env, "proj_1")), Ok(Ok(())));
        assert_eq!(client_contract.try_deposit(&soroban_sdk::String::from_str(&env, "proj_1")), Err(Ok(EscrowError::InvalidState)));
        assert_eq!(client_contract.try_refund(&soroban_sdk::String::from_str(&env, "proj_1")), Err(Ok(EscrowError::InvalidState)));
        assert_eq!(client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &0u32), Err(Ok(EscrowError::InvalidState)));
    }

    #[test]
    fn duplicate_milestone_approval_is_rejected() {
        let env = Env::default();
        env.mock_all_auths();

        let (client, freelancer, _token_seed) = make_addresses(&env);
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let token_id = token_contract.address();
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&client, &100i128);

        let contract_id = env.register(PactFlowEscrow, ());
        let client_contract = PactFlowEscrowClient::new(&env, &contract_id);

        assert_eq!(client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &100i128, &2u32), Ok(Ok(())));
        assert_eq!(client_contract.try_deposit(&soroban_sdk::String::from_str(&env, "proj_1")), Ok(Ok(())));
        assert_eq!(client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &0u32), Ok(Ok(())));
        assert_eq!(client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &0u32), Err(Ok(EscrowError::DuplicateOperation)));
    }
}
