#!/usr/bin/env bash

set -euo pipefail

: "${CONTRACT_ID:?Set CONTRACT_ID to the deployed contract id}"
: "${CLIENT_ACCOUNT:?Set CLIENT_ACCOUNT to the source account that authorizes client operations}"
: "${NETWORK:=testnet}"

CLIENT_ADDRESS="${CLIENT_ADDRESS:?Set CLIENT_ADDRESS to the client public key}"
FREELANCER_ADDRESS="${FREELANCER_ADDRESS:?Set FREELANCER_ADDRESS to the freelancer public key}"
TOKEN_ADDRESS="${TOKEN_ADDRESS:?Set TOKEN_ADDRESS to the token contract address}"
AMOUNT_STROOPS="${AMOUNT_STROOPS:-10000000}"
MILESTONES_TOTAL="${MILESTONES_TOTAL:-3}"

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source-account "$CLIENT_ACCOUNT" \
  -- \
  initialize \
  --client "$CLIENT_ADDRESS" \
  --freelancer "$FREELANCER_ADDRESS" \
  --token "$TOKEN_ADDRESS" \
  --amount "$AMOUNT_STROOPS" \
  --milestones_total "$MILESTONES_TOTAL"

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source-account "$CLIENT_ACCOUNT" \
  -- \
  deposit

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source-account "$CLIENT_ACCOUNT" \
  -- \
  approveMilestone \
  --milestone_index 0

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source-account "$CLIENT_ACCOUNT" \
  -- \
  approveMilestone \
  --milestone_index 1

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source-account "$CLIENT_ACCOUNT" \
  -- \
  approveMilestone \
  --milestone_index 2

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source-account "$CLIENT_ACCOUNT" \
  -- \
  getEscrow
