# Staking Specification

- APR fixed at deploy (immutable).
- Accounting tracks `amount`, `rewardDebt`, and timestamps; rewards accrue linearly.
- `stake(amount)`, `claim()`, `unstake(amount)`.
- Emergency pause blocks new stakes; withdrawals/claims remain enabled.
- Events emitted for indexers.
