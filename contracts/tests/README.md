# PactFlow Escrow Tests

The executable Soroban tests live in `escrow/tests/escrow.rs` and the contract unit tests live in `escrow/src/lib.rs`.

Coverage includes:

- initialization
- double initialization prevention
- deposit state transition
- milestone approval and duplicate approval rejection
- final release after the last milestone approval
- refund and cancel state checks
- read-only escrow queries

Run them from the contract crate once Soroban tooling is installed:

```bash
cd escrow
cargo test
```
