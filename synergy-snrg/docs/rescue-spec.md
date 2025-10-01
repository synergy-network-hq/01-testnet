# Self-Rescue Specification

**Goals:** Enable a user to recover SNRG if their wallet is compromised, **without owner intervention** and **without seizures**.

## Flow
1. User calls `registerPlan(recovery, delay)` and `approve(registry, type(uint256).max)`.
2. User calls `initiateRescue()` -> sets ETA = now + delay.
3. After ETA, *anyone* may call `executeRescue(victim)`:
   - Registry verifies maturation; triggers `token.transferFrom(victim, recovery, balance)`.
4. User may call `cancelRescue()` before ETA to abort.

**Security properties**
- Non-transferability preserved except for the exact rescue movement, which is opt-in and timelocked.
- Registry is whitelisted as a **rescue executor** in the token's transfer gate logic.
