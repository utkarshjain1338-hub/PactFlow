# PactFlow Soroban Escrow MVP

This workspace contains the production-quality MVP escrow contract for PactFlow.

## Scope

The contract is intentionally small:

- one contract instance manages one escrow
- one client
- one freelancer
- one token contract address
- one total amount
- a milestone bitmap to prevent duplicate approvals

It does not include arbitration, DAO governance, partial payouts, pausing, or upgrade flows.

## Workspace Layout

- `escrow/` - the Soroban contract crate
- `deploy/` - deployment and invocation scripts
- `tests/` - contract tests and smoke checks

## Contract Functions

### `initialize`

Creates the escrow record once.

Inputs:

- client address
- freelancer address
- token contract address
- exact amount to escrow
- number of milestones

Behavior:

- stores the escrow in instance storage
- records the creation timestamp
- emits `EscrowCreated`
- refuses a second initialization

### `deposit`

Transfers the exact escrow amount from the client into the contract.

Behavior:

- requires client authorization
- only works from the `Created` state
- transfers the exact amount through the token contract
- changes state to `Funded`
- emits `FundsDeposited`

### `approveMilestone`

Marks one milestone as approved.

Behavior:

- requires client authorization
- uses a milestone bitmap so the same milestone cannot be approved twice
- only works while the escrow is funded
- when the last milestone is approved, the contract transfers funds to the freelancer
- emits `MilestoneApproved`
- emits `FundsReleased` on the final approval

### `refund`

Returns the escrowed funds to the client.

Behavior:

- requires client authorization
- only works while the escrow is funded
- transfers the full amount back to the client
- changes state to `Refunded`
- emits `RefundIssued`

### `cancel`

Cancels an unfunded escrow.

Behavior:

- requires client authorization
- only works while the escrow is still `Created`
- changes state to `Cancelled`
- no funds move

### `getEscrow`

Returns the current escrow snapshot.

Behavior:

- read-only
- returns client, freelancer, token, amount, status, milestone counts, and creation time

## Events

- `EscrowCreated`
- `FundsDeposited`
- `MilestoneApproved`
- `FundsReleased`
- `RefundIssued`

## Deployment

See `deploy/deploy.sh`.

## Invoke Examples

See `deploy/invoke_examples.sh`.

## Testing

Run the contract tests from `contracts/escrow` once Soroban tooling is installed:

```bash
cargo test
```

The contract uses Soroban SDK `27.0.2` and targets `wasm32v1-none`.
