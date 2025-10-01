**Monitoring Nodes with the CLI**

---

**1. Overview**

This tutorial shows how to monitor the performance and health of your Synergy full or validator node using the command-line interface (CLI). CLI monitoring ensures uptime, sync integrity, and participation in consensus and governance.

---

**2. Prerequisites**

* Node installed and running
* Synergy CLI installed and accessible
* Proper permissions to access logs and config files

---

**3. Check Node Sync Status**

```bash
synergy-cli node status
```

Outputs:

* Block height
* Syncing progress
* Peer count
* Latest block timestamp

---

**4. View Validator Uptime and Cluster Activity**

```bash
synergy-cli validator uptime
```

Returns percentage uptime and missed blocks over recent epochs.

Check cluster membership:

```bash
synergy-cli cluster info --address sYnQ-validator...
```

---

**5. View Logs in Real Time**

```bash
tail -f ~/.synergy/logs/synergy-node.log
```

Or use custom log path from your node config.

---

**6. Network Peers and Connection Health**

```bash
synergy-cli peers list
```

* Returns connected peers and latency

---

**7. Monitor Prometheus Metrics Port**

If enabled in config, open:

```
http://localhost:9000/metrics
```

To view system health in Prometheus format.

---

**8. Snapshot Sync Status**

Check if you're syncing from snapshot:

```bash
synergy-cli snapshot status
```

To re-apply snapshot:

```bash
./scripts/apply-snapshot.sh
```

---

**9. Restart or Update Node**

Restart node using systemd:

```bash
sudo systemctl restart synergy-node
```

Update CLI:

```bash
cd ~/synergy-cli && git pull && cargo build --release
```

---

**10. Conclusion**

Monitoring with the CLI gives you granular, real-time control over your node’s health and validator status. These tools are critical for staying synced, avoiding slashing, and maximizing uptime in the Synergy Network.
