# Architecture Overview

This document explains how **non-transferability**, **self-rescue**, **staking**, **presale**, and **swap** compose across Ethereum and Solana.

## Non-Transferability

- **EVM**: `SNRGToken.sol` overrides OpenZeppelin v5 `_update` to revert every transfer unless:
  - `to` or `from` is the **staking** or **swap** contract; or
  - the caller is an **authorized rescue executor** and the **victim's rescue timelock has matured**.
- **Solana**: Token-2022 **TransferHook** rejects all transfers unless destination/source is whitelisted (staking/swap) or a CPI from the Rescue PDA after timelock.

## Self-Rescue (Opt-in, Ownerless, Timelocked)

- Users register a **recovery address** and **delay** (≥ 1 day).
- Users initiate rescue -> timelock starts -> after ETA anyone calls `executeRescue(victim)` which moves **full balance** to recovery.
- Victim can cancel before ETA. **No owner or multisig intervention is required.**

## Staking

- Fixed APR, pull-based claim. Emergency pause blocks new stakes, not withdrawals/claims.

## Presale

- Receives funds, **distributes locked SNRG** directly from Treasury via `transferFrom`. Funds immediately forwarded to Treasury.

## Swap

- **Burn for receipt**; on finalize, publish **Merkle root** for mainnet claim.
- Immutable after finalize (no param changes).

## Governance

- All ownable contracts transfer ownership to a **Timelock** controlled by the **Treasury Multisig**. No EOA privileged.
