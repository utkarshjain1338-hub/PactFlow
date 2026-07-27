#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACT_DIR="${SCRIPT_DIR}/../escrow"

: "${SOURCE_ACCOUNT:?Set SOURCE_ACCOUNT to the Stellar account that will deploy the contract}"
NETWORK="${NETWORK:-testnet}"

cd "$CONTRACT_DIR"

stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/pactflow_escrow.wasm \
  --source-account "$SOURCE_ACCOUNT" \
  --network "$NETWORK"
