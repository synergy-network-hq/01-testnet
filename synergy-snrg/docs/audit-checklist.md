# Internal Audit Checklist (CertiK/ToB/OZ-Style)

**Architecture & Design**

- [ ] Non-transferability enforced at token layer; only staking/swap/rescue allowed.
- [ ] No EOA privileged roles; ownership = TimelockController + Multisig.
- [ ] Fixed supply; no further minting.

**Token (EVM)**

- [ ] `_update` gate audited; revert paths complete.
- [ ] Burn path reachable only via swap; no unexpected burns/mints.
- [ ] Decimals constant = 9.

**Rescue**

- [ ] Opt-in only; delay ≥ 1 day.
- [ ] Cancellation before ETA available.
- [ ] Execution permissionless post-ETA.
- [ ] No owner seizure mechanism.

**Staking**

- [ ] Linear accrual; APR within bounds.
- [ ] Pausing affects only new stakes.
- [ ] No reentrancy, math overflow, or DoS vectors.

**Presale**

- [ ] Funds forwarded to treasury; no stuck ETH.
- [ ] Allowlist/caps correct; arithmetic checked.
- [ ] Requires Treasury approval for token distribution.

**Swap**

- [ ] Receipts accurate; finalized immutably sets root.

**Testing**

- [ ] Foundry unit + fuzz + coverage ≥ 90% critical paths.
- [ ] Echidna invariants: no unintended transfer; no mint/burn outside allowed paths.
- [ ] Slither: 0 High/Critical.

**Solana**

- [ ] TransferHook strictly enforced.
- [ ] PDAs sized safely; rent/compute within limits.
