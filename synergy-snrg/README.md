# Synergy Presale Coin (SNRG) — Dual-Chain Locked Presale System

**Chains:** Ethereum (EVM) + Solana (Anchor, Token-2022 Transfer Hook)  
**Token:** Synergy Presale Coin — `SNRG` (6,000,000,000 per chain)  
**Website:** https://synergy-network.io

This repository implements the complete presale lifecycle for **locked, non-transferable** presale tokens with:

- **Non-transferability at the token layer** (only staking, swap, and rescue registry transfers are permitted)
- **Presale Staking** (fixed-rate, non-custodial accounting, pull-based rewards)
- **Presale Purchase** (caps, optional allowlist, direct locked SNRG distribution)
- **Swap** (burn-to-receipt; emit Merkle root for mainnet claim at TGE)
- **Opt-in Self-Rescue** (ownerless, timelocked, permissionless execution by user/recovery)
- **Multisig + Timelock Governance** (no privileged EOAs)
- **Security-first engineering**—invariants, fuzz/property tests, and audit artifacts

> **Supply per chain:** 6,000,000,000 SNRG minted at genesis to a Treasury multisig on **each** chain.  
> **Ownership:** All contracts/programs must be owned by a time-locked multisig, never EOAs.

---

## Repository Structure

```
.
├── ethereum/
│   ├── contracts/
│   │   ├── SNRGToken.sol
│   │   ├── SelfRescueRegistry.sol
│   │   ├── SNRGStaking.sol
│   │   ├── SNRGPresale.sol
│   │   └── SNRGSwap.sol
│   ├── script/
│   │   ├── Deploy.s.sol
│   │   └── Config.example.json
│   ├── test/
│   │   ├── Token.t.sol
│   │   ├── Rescue.t.sol
│   │   ├── Staking.t.sol
│   │   ├── Presale.t.sol
│   │   └── Swap.t.sol
│   ├── foundry.toml
│   └── remappings.txt
├── solana/
│   ├── Anchor.toml
│   ├── programs/
│   │   ├── snrg_token/
│   │   │   ├── Cargo.toml
│   │   │   └── src/lib.rs
│   │   ├── snrg_staking/
│   │   │   ├── Cargo.toml
│   │   │   └── src/lib.rs
│   │   ├── snrg_presale/
│   │   │   ├── Cargo.toml
│   │   │   └── src/lib.rs
│   │   └── snrg_swap/
│   │       ├── Cargo.toml
│   │       └── src/lib.rs
│   ├── tests/
│   │   ├── snrg_token.spec.ts
│   │   ├── snrg_staking.spec.ts
│   │   ├── snrg_presale.spec.ts
│   │   └── snrg_swap.spec.ts
│   └── Cargo.toml
├── metadata/
│   ├── ethereum_snrg.json
│   └── solana_snrg.json
├── docs/
│   ├── README-ARCH.md
│   ├── tokenomics.md
│   ├── governance-and-timelock.md
│   ├── rescue-spec.md
│   ├── staking-spec.md
│   ├── swap-bridge-spec.md
│   ├── audit-checklist.md
│   └── sequences/
│       ├── presale_purchase.mmd
│       ├── staking_flow.mmd
│       ├── rescue_flow.mmd
│       └── swap_flow.mmd
└── audits/
    ├── slither-report.md
    ├── echidna-config.yaml
    ├── foundry-coverage.txt
    └── anchor-test-report.md
```

---

## Quickstart

### Ethereum (Foundry)

```bash
cd ethereum
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2
forge build
forge test -vv
```

**Deploy (example):**
```bash
forge script script/Deploy.s.sol:Deploy   --broadcast   --rpc-url $RPC_URL   --private-key $DEPLOYER_KEY   -vvvv
```

> Ownership transfer to **Timelock + Multisig** is performed inside the deploy script. Ensure you fill `script/Config.example.json` and copy to `Config.json` before deployment.

### Solana (Anchor)

```bash
cd solana
anchor build
anchor test
```

**Initialize Mint & Transfer Hook:**
- The `snrg_token` program exposes `initialize_mint_with_hook` which configures a Token-2022 mint with the transfer hook extension and sets program authority PDAs to enforce **non-transferability** except to whitelisted destinations (staking/swap) and timed rescue flows.

---

## Acceptance Criteria Mapping

1. **Non-transferability**: `SNRGToken.sol::_update` blocks transfers except staking/swap and rescue-executor. Solana Transfer Hook enforces same.  
2. **Rescue**: `SelfRescueRegistry.sol` (EVM) opt-in, timelocked, no-owner intervention; Solana PDAs mirror logic.  
3. **Fixed Supply**: 6B minted at genesis to Treasury multisig (both chains).  
4. **Ownership**: Deploy script assigns ownership to **Timelock + Multisig**; no EOA privileged.  
5. **Metadata**: `metadata/ethereum_snrg.json` and `metadata/solana_snrg.json` fully populated.  
6. **Tests**: Foundry & Anchor tests exercise invariants and flows; slither/echidna configs included.  
7. **Docs**: All flows, CLIs, and governance documented.  
8. **Bounded gas/compute**: No unbounded loops; O(1) or O(log n) paths only.  
9. **Audit**: `docs/audit-checklist.md` + `/audits` artifacts.

---

## Disclaimers

- Addresses in `deployments.json`/`addresses.json` are placeholders until deployment.  
- Review and update **treasury multisig** and **timelock parameters** before mainnet/testnet deployment.
- Always re-run audits after any change.

*Generated on 2025-10-01T10:18:14.990219Z*
