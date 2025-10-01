# Swap & Bridge Specification

- Users burn SNRG via `burnForReceipt(amount)` on EVM or equivalent on Solana.
- Contract records `burned[user] += amount` and emits `Burned` events.
- After the presale window closes, owners **finalize** the contract, publishing a **Merkle root** of (account, amount) for mainnet claim.
- No mutability after finalization.
