import re

with open("contracts/escrow/src/lib.rs", "r") as f:
    code = f.read()

# Remove ESCROW_KEY
code = code.replace('const ESCROW_KEY: Symbol = symbol_short!("escrow");', 'use types::DataKey;')

# Update signatures
code = code.replace(
    'pub fn initialize(\n        env: Env,\n        client: Address,',
    'pub fn initialize(\n        env: Env,\n        project_id: soroban_sdk::String,\n        client: Address,'
)
code = code.replace('pub fn deposit(env: Env) -> Result<(), EscrowError>', 'pub fn deposit(env: Env, project_id: soroban_sdk::String) -> Result<(), EscrowError>')
code = code.replace('pub fn approveMilestone(env: Env, milestone_index: u32) -> Result<(), EscrowError>', 'pub fn approveMilestone(env: Env, project_id: soroban_sdk::String, milestone_index: u32) -> Result<(), EscrowError>')
code = code.replace('pub fn getEscrow(env: Env) -> Result<EscrowView, EscrowError>', 'pub fn getEscrow(env: Env, project_id: soroban_sdk::String) -> Result<EscrowView, EscrowError>')
code = code.replace('pub fn refund(env: Env) -> Result<(), EscrowError>', 'pub fn refund(env: Env, project_id: soroban_sdk::String) -> Result<(), EscrowError>')
code = code.replace('pub fn cancel(env: Env) -> Result<(), EscrowError>', 'pub fn cancel(env: Env, project_id: soroban_sdk::String) -> Result<(), EscrowError>')

# Update implementations
code = code.replace('env.storage().instance().has(&ESCROW_KEY)', 'env.storage().persistent().has(&DataKey::Escrow(project_id.clone()))')
code = code.replace('Self::save_escrow(&env, &escrow);', 'Self::save_escrow(&env, &project_id, &escrow);')
code = code.replace('Self::bump_ttl(&env);', 'Self::bump_ttl(&env, &project_id);')
code = code.replace('Self::load_escrow(&env)?', 'Self::load_escrow(&env, &project_id)?')

# Update helper functions
code = code.replace('fn load_escrow(env: &Env) -> Result<EscrowData, EscrowError> {', 'fn load_escrow(env: &Env, project_id: &soroban_sdk::String) -> Result<EscrowData, EscrowError> {')
code = code.replace('env.storage()\n            .instance()\n            .get(&ESCROW_KEY)', 'env.storage()\n            .persistent()\n            .get(&DataKey::Escrow(project_id.clone()))')
code = code.replace('fn save_escrow(env: &Env, escrow: &EscrowData) {', 'fn save_escrow(env: &Env, project_id: &soroban_sdk::String, escrow: &EscrowData) {')
code = code.replace('env.storage().instance().set(&ESCROW_KEY, escrow);', 'env.storage().persistent().set(&DataKey::Escrow(project_id.clone()), escrow);')
code = code.replace('fn bump_ttl(env: &Env) {', 'fn bump_ttl(env: &Env, project_id: &soroban_sdk::String) {')
code = code.replace('env.storage()\n            .instance()\n            .extend_ttl(TTL_THRESHOLD, TTL_EXTENSION);', 'env.storage()\n            .persistent()\n            .extend_ttl(&DataKey::Escrow(project_id.clone()), TTL_THRESHOLD, TTL_EXTENSION);')

# Update tests
code = code.replace('client_contract.try_initialize(&client, &freelancer, &token_id, &1_000_000i128, &2u32)', 'client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &1_000_000i128, &2u32)')
code = code.replace('client_contract.try_getEscrow()', 'client_contract.try_getEscrow(&soroban_sdk::String::from_str(&env, "proj_1"))')
code = code.replace('client_contract.try_deposit()', 'client_contract.try_deposit(&soroban_sdk::String::from_str(&env, "proj_1"))')
code = code.replace('client_contract.try_approveMilestone(&0u32)', 'client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &0u32)')
code = code.replace('client_contract.try_approveMilestone(&1u32)', 'client_contract.try_approveMilestone(&soroban_sdk::String::from_str(&env, "proj_1"), &1u32)')
code = code.replace('client_contract.try_initialize(&client, &freelancer, &token_id, &100i128, &1u32)', 'client_contract.try_initialize(&soroban_sdk::String::from_str(&env, "proj_1"), &client, &freelancer, &token_id, &100i128, &1u32)')
code = code.replace('client_contract.try_cancel()', 'client_contract.try_cancel(&soroban_sdk::String::from_str(&env, "proj_1"))')
code = code.replace('client_contract.try_refund()', 'client_contract.try_refund(&soroban_sdk::String::from_str(&env, "proj_1"))')

with open("contracts/escrow/src/lib.rs", "w") as f:
    f.write(code)

print("Patch complete")
