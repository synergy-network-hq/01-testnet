## Node Syncing & Snapshot Tools

### 1. Overview

This document describes the available tools and processes for syncing Synergy Network nodes efficiently using snapshots and fast-sync techniques. It also covers snapshot creation, restoration, and troubleshooting.

---

### 2. Sync Modes Supported

* **Full Sync:** Downloads entire blockchain state from genesis
* **Fast Sync:** Syncs recent blocks + snapshot of latest state
* **Archive Sync (Dev Only):** Stores all historical states (disk-intensive)

---

### 3. Snapshot Format

* Directory: `/snapshots/`
* File: `synergy_snapshot_<epoch>.tar.gz`
* Includes:

  * Chain state DB (`/data/`)
  * Validator metadata
  * Genesis config hash

---

### 4. Snapshot Creation (Validator Node)

```bash
synergy-cli snapshot create --output /snapshots/snapshot_latest.tar.gz
```

* Recommended during maintenance window
* Compresses current DB into snapshot archive

---

### 5. Snapshot Restoration

```bash
synergy-cli snapshot restore --file /snapshots/snapshot_latest.tar.gz
```

* Replaces existing DB
* Requires matching genesis hash
* Sync resumes from restored block height

---

### 6. Auto-Sync Tools

#### 6.1 `fast-sync.sh`

* Checks for latest snapshot from trusted mirror
* Verifies hash and downloads
* Unpacks into data directory

#### 6.2 Mirror Repository

* URL: `https://snapshots.synergy-network.io`
* Snapshot Index JSON: `snapshots.json`
* Mirrors verified and signed by DAO signer nodes

---

### 7. CLI Utilities

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `snapshot create`  | Archive current node state                   |
| `snapshot restore` | Restore from snapshot archive                |
| `sync-status`      | Show current sync height and peer stats      |
| `prune`            | Clean old state history to reduce disk space |

---

### 8. Performance Tips

* SSD required for snapshot operations
* Ensure at least 2x snapshot size in free space
* Use `screen` or `tmux` during long sync operations

---

### 9. Troubleshooting

* **Stuck on block height:**

  * Check logs for "peer mismatch" errors
  * Retry full sync if hash mismatch
* **Snapshot not recognized:**

  * Ensure snapshot version matches software version
  * Re-init node before restore

---

### 10. Validator Sync SLA

* Validators must sync to head block within 2 epochs
* Failure to sync results in:

  * Temporary cluster exclusion
  * Slashing (if stake is active)

---

### 11. References

* Snapshot Scripts: `/deployment_scripts/fast-sync.sh`
* CLI Reference: `/tools/cli/commands.md`
* Verified Snapshot Hashes: `https://snapshots.synergy-network.io/hashes.txt`
