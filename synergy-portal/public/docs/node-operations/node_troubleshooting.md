**Troubleshooting**

---

**1. Overview**

This guide provides solutions to common issues encountered when running or maintaining a Synergy Network node. Topics include syncing problems, RPC failures, validator slashing prevention, and hardware bottlenecks.

---

**2. Node Fails to Start**

**Symptoms**:

* Immediate crash or no output

**Solutions**:

* Check for missing config files (`~/.synergy/config/`)
* Ensure ports `26656`, `26657`, `8545`, `8546` are open
* Run with `--verbose` to get debug output

```bash
synergy-node --verbose
```

---

**3. Node Sync Stuck**

**Symptoms**:

* Block height not increasing

**Solutions**:

* Verify peers:

```bash
synergy-cli peers list
```

* Restart node or reapply snapshot:

```bash
./scripts/apply-snapshot.sh
```

* Re-check logs for block replay or I/O errors

---

**4. RPC or WebSocket Not Responding**

**Symptoms**:

* Cannot access RPC at port 26657
* cURL or dApp integrations failing

**Solutions**:

* Verify node is running:

```bash
ps aux | grep synergy-node
```

* Check firewall rules
* Restart node and ensure correct IP binding in config file (`0.0.0.0` vs `127.0.0.1`)

---

**5. High CPU/Memory Usage**

**Symptoms**:

* System slow or crashing

**Solutions**:

* Prune old blocks
* Upgrade hardware (SSD → NVMe)
* Disable archive mode if not needed
* Monitor with:

```bash
top
htop
iotop
```

---

**6. Missed Blocks (Validator)**

**Symptoms**:

* Dropping out of cluster, missed proposer slots

**Solutions**:

* Restart node and check uptime:

```bash
synergy-cli validator uptime
```

* Enable auto-restart with systemd watchdog
* Move to better hosting (low-latency, high IOPS)

---

**7. Slashing Avoidance**

**Best Practices**:

* Run Prometheus-based monitoring + uptime alerts
* Use `synergy-cli validator status` daily
* Avoid running multiple nodes with the same key (causes double-sign)

---

**8. Log Location and Rotation**

* Default logs: `~/.synergy/logs/`
* Use `logrotate` to avoid disk bloat:

```bash
sudo apt install logrotate
```

---

**9. Snapshot Restore**

Use snapshot to quickly resync node:

```bash
./scripts/apply-snapshot.sh
```

* Always verify snapshot integrity before applying

---

**10. Getting Help**

* Join the [Synergy Network Discord](https://discord.synergy-network.io)
* Post on [GitHub Issues](https://github.com/synergy-network/testnet/issues)
* Check documentation at [docs.synergy-network.io](https://docs.synergy-network.io)

---

**11. Conclusion**

Troubleshooting Synergy nodes requires attention to sync state, hardware performance, validator health, and network configuration. With the right tools and strategies, most issues can be resolved quickly—keeping your node active, performant, and eligible for staking rewards.
