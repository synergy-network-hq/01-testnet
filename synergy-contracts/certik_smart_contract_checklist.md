# 🔒 Smart Contract Security & Audit Checklist

This checklist is designed to help self-audit smart contracts before deploying them,
or submitting them to a professional auditor such as CertiK, Trail of Bits, or OpenZeppelin.

---

## 1. Architecture & Design

- [ ] Are roles (admin/owner) clearly defined?
- [ ] Are contracts upgradeable? If so, are upgrades secured?
- [ ] Are trust assumptions clearly documented?
- [ ] Are tokenomics rules enforced in code (supply cap, mint/burn limits)?

## 2. Access Control

- [ ] Are sensitive functions (mint, burn, pause, upgrade) restricted?
- [ ] Is one role system used consistently (`Ownable` or `AccessControl`)?
- [ ] Is a multisig required for critical roles?
- [ ] Are there hidden backdoors?

## 3. Token Standards Compliance

- [ ] Does ERC-20/721/1155 compliance hold?
- [ ] Are decimals set correctly?
- [ ] Are all important events emitted (mint, burn, transfer)?

## 4. Math & Logic

- [ ] Solidity ^0.8 used (overflow protection)?
- [ ] SafeERC20 used for transfers?
- [ ] Is rounding logic checked in reward systems?
- [ ] Caps enforced (supply, deposits, APR)?
- [ ] Block.timestamp manipulation risk assessed?

## 5. Funds Safety

- [ ] All transfers use safeTransfer?
- [ ] No raw .call.value or transfer?
- [ ] Are staked funds and rewards separated?
- [ ] Rescue functions cannot touch investor funds?

## 6. Reentrancy & State Integrity.

- [ ] ReentrancyGuard applied where external calls exist?
- [ ] Checks-Effects-Interactions followed?
- [ ] Flash-loan exploits mitigated?

## 7. Events & Transparency

- [ ] Are events emitted for all major actions?
- [ ] Indexed fields included?
- [ ] Public view functions for balances, rewards, locks?

## 8. Gas & Efficiency

- [ ] Storage reads minimized?
- [ ] Unbounded loops avoided?
- [ ] Struct packing optimized?
- [ ] Gas griefing risks assessed?

## 9. Testing & Simulation

- [ ] Unit tests cover normal and edge cases?
- [ ] Attack simulations tested (reentrancy, overflow)?
- [ ] Fuzz tests included?

## 10. Investor Protections

- [ ] Immutable rules for APR, unlock, supply?
- [ ] No hidden admin mint?
- [ ] Reward pool solvency documented?
- [ ] Emergency transparency measures in place?

---

## 🎯 Grading Framework

- Critical (CRIT): Investor funds at risk immediately.
- Major (MAJ): Rewards/tokens may be lost due to logic.
- Medium (MED): Economic model weaknesses.
- Minor (MIN): Efficiency, UI, or event issues.
- Informational (INFO): Style, comments, readability.

---

✅ If all sections pass → A/A+ range audit.  
⚠️ Failure in trust/economic design can reduce score to C/B even with secure code.
