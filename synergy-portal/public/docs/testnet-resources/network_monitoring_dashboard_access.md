## Network Monitoring Dashboard Access

### 1. Overview

This document provides details on accessing the Synergy Network’s monitoring dashboards for observing validator performance, block propagation, transaction throughput, and node health in real-time.

---

### 2. Dashboard URL

* **Testnet Dashboard:** `https://monitor.testnet.synergy-network.io`
* **Mainnet Dashboard (post-launch):** `https://monitor.mainnet.synergy-network.io`

---

### 3. Dashboard Features

* **Live Block Explorer Panel:**

  * Real-time display of latest blocks and validator signatures
* **Validator Panel:**

  * Online/offline status
  * Uptime percentage
  * Synergy Score
  * Cluster participation rate
* **Mempool Metrics:**

  * Pending transaction count
  * Gas price histogram
* **System Metrics:**

  * CPU, RAM, and disk usage (self-reporting validator nodes)
  * Peer connection counts
* **Bridge/Sync Status:**

  * UMA + SNS bridge relay status
  * Sync head height comparison across nodes

---

### 4. Login & Permissions

* Public read-only access (Testnet only)
* Admin dashboards require JWT issued from validator key
* Discord login planned for Phase 2

---

### 5. Data Sources

* `prometheus-node-exporter`
* `synergy-metricsd` custom agent
* `json-rpc-exporter`
* `ws-event-watcher`

---

### 6. Alerting System

* Real-time alerts via:

  * Telegram bot
  * Discord webhook
  * Email (admin only)
* Thresholds:

  * Block propagation delay > 5s
  * Validator heartbeat timeout
  * Sync height > 20 blocks behind

---

### 7. API Access

* Prometheus endpoint: `https://monitor.testnet.synergy-network.io/metrics`
* Example query:

  ```
  rate(synergy_blocks_produced[5m])
  ```

---

### 8. Dashboard Technologies

* **Grafana:** Main visualization interface
* **Prometheus:** Timeseries backend
* **Node Exporter:** System stats collection
* **Loki (planned):** Log indexing layer

---

### 9. Running Locally (Dev/Validator Nodes)

```bash
git clone https://github.com/synergy-network/monitoring
cd monitoring
./start-docker-monitoring.sh
```

* Exposes dashboard at `localhost:3000`
* Prometheus config auto-generates from node registry

---

### 10. Future Enhancements

* Bridge relayer performance heatmap
* Smart contract usage dashboards
* Historical proposal voting data panel
* SLA scoring for validator rewards

---

### 11. Resources

* Monitoring Config: `/monitoring/prometheus.yml`
* Grafana Dash JSON: `/monitoring/dashboards/*.json`
* Alert Rules: `/monitoring/alerts/*.yml`
* Admin Panel Docs: `/admin-tools/monitoring-access.md`
