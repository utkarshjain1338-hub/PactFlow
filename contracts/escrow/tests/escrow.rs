use soroban_sdk::{testutils::Address as _, token, Address, Env};

use pactflow_escrow::{EscrowStatus, PactFlowEscrow, PactFlowEscrowClient};

fn addresses(env: &Env) -> (Address, Address, Address) {
    (Address::generate(env), Address::generate(env), Address::generate(env))
}

#[test]
fn smoke_test_cancellation_and_query() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, freelancer, _token_seed) = addresses(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
    token_admin_client.mint(&client, &42i128);

    let contract_id = env.register(PactFlowEscrow, ());
    let client_contract = PactFlowEscrowClient::new(&env, &contract_id);

    assert_eq!(client_contract.try_initialize(&client, &freelancer, &token_id, &42i128, &1u32), Ok(Ok(())));
    let view = client_contract.try_getEscrow().unwrap().unwrap();
    assert_eq!(view.status, EscrowStatus::Created);
    assert_eq!(client_contract.try_cancel(), Ok(Ok(())));
}
