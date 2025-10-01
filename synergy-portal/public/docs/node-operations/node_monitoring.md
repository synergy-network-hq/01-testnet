**Node Monitoring**

---

**1. Overview**

Monitoring Synergy Network nodes is essential for ensuring uptime, tracking performance, detecting faults, and maintaining validator reputation. This document explains how to monitor your node using CLI tools, metrics exporters, dashboards, and alerts.

---

**2. Why Node Monitoring Matters**

* Maintains eligibility for staking rewards
* Preserves Synergy Points (SP) score
* Prevents slashing and penalization
* Helps identify latency, sync issues, or crashes in real time

---

**3. CLI Monitoring Tools**

| Command                        | Description                      |
| ------------------------------ | -------------------------------- |
| `synergy-cli node status`      | Displays sync status, peer count |
| `synergy-cli validator uptime` | Shows recent uptime percentage   |
| `synergy-cli logs follow`      | Live log tailing                 |
| `synergy-cli node metrics`     | Outputs performance metrics      |

---

**4. System Logs and Alerts**

Log location (default):

```bash
~/.synergy/logs/synergy-node.log
```

Auto-restart configuration (systemd):

```bash
systemctl enable synergy-node
systemctl restart synergy-node
```

Add watchdog script to reboot or notify upon crash or freeze.

---

**5. Prometheus Exporter Setup**

Metrics exporter built into node binary:

```bash
synergy-node --metrics --prometheus-port 9000
```

Prometheus scrape config:

```yaml
- job_name: 'synergy'
  static_configs:
    - targets: ['localhost:9000']
```

---

**6. Grafana Dashboard Integration**

* Recommended dashboard includes:

  * Block height
  * Peer count
  * Validator rank
  * CPU, memory, disk usage
  * Cluster sync status
* Use Loki for log ingestion and graph-based alerts

---

**7. External Monitoring Tools**

| Tool        | Functionality                           |
| ----------- | --------------------------------------- |
| Pingdom     | External uptime checker                 |
| UptimeRobot | Sends email/Telegram alerts             |
| StatusCake  | Alternative uptime monitoring           |
| PagerDuty   | Incident response and escalation alerts |

---

**8. Health Metrics to Track**

* Block proposal success rate
* Validation participation rate
* RPC response time
* Number of dropped peers
* Memory/CPU spikes during peak traffic

---

**9. Alert Threshold Recommendations**

| Metric        | Threshold Trigger              |
| ------------- | ------------------------------ |
| Uptime        | < 99.5% over 24h               |
| CPU Usage     | > 85% sustained for 10 min     |
| Missed Blocks | > 2 per epoch                  |
| Sync Lag      | > 5 blocks behind current head |

---

**10. Conclusion**

A well-monitored node is a healthy node. With the tools provided by the Synergy CLI, built-in Prometheus metrics, and third-party dashboard support, validators and operators can ensure high availability, reliability, and performance to remain competitive in the PoSy consensus ecosystem.
