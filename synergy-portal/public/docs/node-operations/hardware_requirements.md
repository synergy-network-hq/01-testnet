**Hardware Requirements**

---

**1. Overview**

Running a Synergy Network node—whether a full node, validator, or archive node—requires reliable hardware to maintain network performance, uptime, and security. This document details the minimum and recommended system specifications for different node roles.

---

**2. Node Types and Hardware Profiles**

| Node Role      | Description                                       |
| -------------- | ------------------------------------------------- |
| Full Node      | Verifies blocks, relays data, stores full chain   |
| Validator Node | Proposes/validates blocks, requires bonded stake  |
| Archive Node   | Stores full historical state; used by explorers   |
| Light Client   | Only verifies headers; not supported as validator |

---

**3. Minimum Specifications (Full Node)**

| Component | Minimum               |
| --------- | --------------------- |
| CPU       | 4 cores               |
| RAM       | 16 GB                 |
| Storage   | 500 GB SSD            |
| Network   | 100 Mbps              |
| OS        | Ubuntu 20.04+, Debian |

---

**4. Recommended Specifications (Validator Node)**

| Component | Recommended         |
| --------- | ------------------- |
| CPU       | 8+ physical cores   |
| RAM       | 32+ GB              |
| Storage   | 1 TB NVMe SSD       |
| Network   | 500 Mbps+ symmetric |
| OS        | Linux server distro |

---

**5. Archive Node Requirements**

* Storage: 2+ TB SSD or NVMe
* CPU: 8+ cores
* RAM: 32–64 GB
* Optional: RAID configuration for redundancy

---

**6. High-Availability Validator Setup (Optional)**

* Redundant hot + cold standby node configuration
* Cloud or hybrid VPS + physical server pairing
* External monitoring via Pingdom, UptimeRobot, or Prometheus
* Auto-restart systemd + watchdog script for crash recovery

---

**7. Cloud Providers Tested**

| Provider     | Notes                               |
| ------------ | ----------------------------------- |
| DigitalOcean | Stable for full nodes, limited IOPS |
| Hetzner      | Ideal for validators (high IOPS)    |
| AWS EC2      | Flexible but costly long-term       |
| OVH          | Reliable for archive/storage nodes  |

---

**8. Hardware Wallet Integration**

* Validator wallets can optionally use:

  * Ledger Nano X (Dilithium support via firmware update planned)
  * Trezor Model T (PQ wrappers in development)
* Cold storage for validator keypair not recommended unless you use threshold signing

---

**9. Performance Monitoring Tools**

* Grafana + Prometheus (metrics exporter built-in)
* Loki (log aggregation)
* Node health CLI:

```bash
synergy-cli node stats
```

---

**10. Conclusion**

Investing in the right hardware setup ensures your node’s reliability, governance eligibility, and long-term validator rewards. The Synergy Network is designed for scalability, and nodes with high uptime and performance will receive enhanced Synergy Points and staking incentives.
