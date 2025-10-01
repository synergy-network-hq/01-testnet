# Synergy Network Validator Guide

## 🎯 Overview

Validators are the backbone of the Synergy Network, responsible for block production, transaction validation, and maintaining network consensus through the **Proof of Synergy (PoSy)** mechanism. This guide explains how to set up, configure, and operate a validator node.

---

## 🏆 Validator Responsibilities

As a validator, you will:

- **Produce Blocks**: Create new blocks containing validated transactions
- **Validate Transactions**: Verify transaction authenticity and correctness
- **Participate in Consensus**: Engage in PoSy consensus with other validators
- **Maintain Network Security**: Help secure the network through collaborative validation
- **Earn Rewards**: Receive synergy points and transaction fees for honest participation

---

## ✅ Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **CPU** | 4 cores | 8+ cores | High single-thread performance preferred |
| **RAM** | 8 GB | 16+ GB | For blockchain state and mempool |
| **Storage** | 100 GB SSD | 500 GB NVMe | Fast storage critical for performance |
| **Network** | 100 Mbps | 1 Gbps | Low latency, stable connection |
| **Uptime** | 99.9% | 99.99% | Reliable power and internet required |

### Software Requirements

- **Operating System**: Ubuntu 20.04+ / Debian 11+ (or WSL2 on Windows)
- **Rust**: Latest stable toolchain (`rustup`)
- **Build Tools**: `build-essential`, `libssl-dev`, `pkg-config`
- **Git**: For repository management
- **Systemd**: For service management (Linux)

### Network Requirements

- **Static IP**: Required for P2P connectivity
- **Open Ports**: 30303 (P2P), 8545 (RPC), 8546 (WebSocket)
- **Firewall**: Properly configured for node communication
- **Domain/Static IP**: For reliable peer connectivity

---

## 🚀 Validator Setup

### 1. Environment Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y build-essential libssl-dev pkg-config curl git ufw

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown

# Install Node.js (for monitoring tools)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create synergy user
sudo useradd -r -s /bin/false -m synergy
sudo usermod -aG sudo synergy
```

### 2. Clone and Build

```bash
# Clone repository (as synergy user)
sudo -u synergy git clone https://github.com/synergy-network/testnet.git /home/synergy/testnet
cd /home/synergy/testnet

# Build the node
sudo -u synergy cargo build --release --bin synergy-testnet

# Set ownership
sudo chown -R synergy:synergy /home/synergy/testnet
```

### 3. Configuration

#### Network Configuration (`config/network-config.toml`)

```toml
[network]
id = 7963749
name = "Synergy Testnet"
p2p_port = 30303
rpc_port = 8545
ws_port = 8546
max_peers = 50
bootnodes = [
  "enode://d18491c5a94ef758b6a15478818a1903054c830afdc2cc6b8d04d30d7c8e94b5bcd9c98f33c7ff5a02f7e4c7a5394fc5a4a41d1552d9e43c0e4745a3127c93d4@testnet.synergy.network:30303"
]

[network.listen]
p2p = "0.0.0.0:30303"
rpc = "0.0.0.0:8545"
ws  = "0.0.0.0:8546"

[blockchain]
block_time = 5
max_gas_limit = "0x2fefd8"
chain_id = 7963749
```

#### Validator Configuration

Create a validator configuration file:

```bash
# Create validator config directory
sudo -u synergy mkdir -p /home/synergy/testnet/config/validator

# Generate validator keys (this will be replaced with proper key generation)
sudo -u synergy openssl rand -hex 32 > /home/synergy/testnet/config/validator/private_key.txt
```

**config/validator/config.toml:**
```toml
[validator]
# Validator identification
name = "My Synergy Validator"
website = "https://my-validator.com"
description = "Reliable Synergy Network validator"

# Validator keys (generate securely)
private_key_path = "config/validator/private_key.txt"
public_key = "0x..." # Will be generated

# Performance settings
max_block_size = 1048576  # 1MB
max_tx_pool_size = 1000
enable_metrics = true
metrics_port = 6060

# Backup settings
backup_enabled = true
backup_interval_hours = 24
backup_retention_days = 30
backup_path = "/home/synergy/backups"

# Security settings
enable_firewall = true
allowed_rpc_ips = ["127.0.0.1", "::1"]
rate_limit_per_minute = 1000
```

### 4. Validator Registration

#### Generate Validator Keys

```bash
# Navigate to testnet directory
cd /home/synergy/testnet

# Generate secure validator keys (this is a placeholder - real implementation needed)
sudo -u synergy openssl ecparam -name prime256v1 -genkey -noout -out config/validator/validator_key.pem
sudo -u synergy openssl ec -in config/validator/validator_key.pem -pubout -out config/validator/validator_pub.pem

# Extract public key for registration
VALIDATOR_PUB_KEY=$(sudo -u synergy openssl ec -in config/validator/validator_key.pem -pubout -outform DER | base64 -w 0)
echo "Validator Public Key: $VALIDATOR_PUB_KEY"
```

#### Register with Genesis

To become an initial validator, your public key must be included in the genesis block. Contact the Synergy Network team or submit a registration request.

For testnet participation, use one of the pre-configured validator addresses:

- `sYnQ1ffzcyq7l0sw7v9fhrx2wdvxxzv9q5mj3ehd6yl3e`
- `sYnU1v3smghwdd2zj7vpgkx0fn3cf0k57eq7hqufup0tp`
- `sYnQ1uhf2zhq3rxtjqsc9qxyftu9v4kpa0zw8d7uux7g4`

### 5. Service Setup

Create a systemd service for automatic startup:

```bash
# Create service file
sudo tee /etc/systemd/system/synergy-validator.service > /dev/null <<EOF
[Unit]
Description=Synergy Network Validator Node
After=network-online.target
Wants=network-online.target

[Service]
User=synergy
Group=synergy
Type=simple
Restart=always
RestartSec=5
WorkingDirectory=/home/synergy/testnet
ExecStart=/home/synergy/testnet/target/release/synergy-testnet start
ExecReload=/bin/kill -HUP $MAINPID
StandardOutput=journal
StandardError=journal

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/home/synergy/testnet/data /home/synergy/backups

# Resource limits
LimitNOFILE=65536
MemoryLimit=2G

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable synergy-validator

# Start the service
sudo systemctl start synergy-validator

# Check status
sudo systemctl status synergy-validator
```

### 6. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow required ports
sudo ufw allow 30303/tcp  # P2P communication
sudo ufw allow 8545/tcp  # RPC
sudo ufw allow 8546/tcp  # WebSocket
sudo ufw allow 22/tcp    # SSH (restrict to your IP)

# Allow specific IPs for RPC (recommended)
sudo ufw allow from YOUR_IP to any port 8545

# Check firewall status
sudo ufw status
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check service status
sudo systemctl status synergy-validator

# View logs
sudo journalctl -u synergy-validator -f
sudo tail -f /home/synergy/testnet/data/logs/synergy-node.log

# Check node info via RPC
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"synergy_nodeInfo","id":1}' \
  http://localhost:8545

# Monitor system resources
htop
df -h
free -h
```

### Performance Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor network connections
sudo netstat -tlnp | grep synergy-testnet
sudo ss -tlnp | grep 30303

# Check disk usage
du -sh /home/synergy/testnet/data/
ls -lah /home/synergy/testnet/data/logs/
```

### Backup Strategy

```bash
# Create backup script
sudo tee /home/synergy/backup-validator.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/home/synergy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup blockchain data
cp -r /home/synergy/testnet/data/chain $BACKUP_DIR/chain_$DATE/
cp /home/synergy/testnet/data/chain.json $BACKUP_DIR/
cp /home/synergy/testnet/data/validators.json $BACKUP_DIR/

# Backup configuration
cp -r /home/synergy/testnet/config $BACKUP_DIR/config_$DATE/

# Compress backup
cd $BACKUP_DIR
tar -czf validator_backup_$DATE.tar.gz chain_$DATE/ chain.json validators.json config_$DATE/
rm -rf chain_$DATE/ config_$DATE/

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "validator_backup_*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: validator_backup_$DATE.tar.gz"
EOF

# Make executable and run
sudo chmod +x /home/synergy/backup-validator.sh
sudo -u synergy /home/synergy/backup-validator.sh
```

### Log Rotation

The node automatically rotates logs, but you can also manually rotate:

```bash
# Check current log size
ls -lh /home/synergy/testnet/data/logs/

# Force log rotation (if needed)
sudo systemctl reload synergy-validator

# View recent logs
sudo journalctl -u synergy-validator --since "1 hour ago"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Node Won't Start
```bash
# Check for port conflicts
sudo netstat -tlnp | grep 30303
sudo lsof -i :30303

# Check available disk space
df -h /home/synergy/testnet/

# Check file permissions
sudo chown -R synergy:synergy /home/synergy/testnet/
sudo chmod -R 755 /home/synergy/testnet/
```

#### Sync Issues
```bash
# Check peer connections
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"synergy_syncing","id":1}' \
  http://localhost:8545

# Restart with fresh sync
sudo systemctl stop synergy-validator
rm -rf /home/synergy/testnet/data/chain/*
sudo systemctl start synergy-validator
```

#### High Resource Usage
```bash
# Check what's using resources
htop
iotop
nethogs

# Check for memory leaks
sudo systemctl stop synergy-validator
sudo systemctl start synergy-validator

# Monitor over time
vmstat 1 60
```

### Debug Mode

Run the node in debug mode for detailed logging:

```bash
# Stop the service
sudo systemctl stop synergy-validator

# Run manually with debug logging
cd /home/synergy/testnet
RUST_LOG=debug ./target/release/synergy-testnet start

# Or set environment variables
export SYNERGY_LOG_LEVEL=debug
export SYNERGY_LOG_FILE=/home/synergy/testnet/data/logs/debug.log
./target/release/synergy-testnet start
```

### Recovery Procedures

#### Database Corruption
```bash
# Stop the node
sudo systemctl stop synergy-validator

# Backup current data
cp -r /home/synergy/testnet/data /home/synergy/testnet/data.backup

# Remove corrupted data
rm -rf /home/synergy/testnet/data/chain/*
rm /home/synergy/testnet/data/chain.json

# Restart (will rebuild from genesis)
sudo systemctl start synergy-validator
```

#### Validator Key Compromised
```bash
# Stop the node
sudo systemctl stop synergy-validator

# Generate new keys
openssl ecparam -name prime256v1 -genkey -noout -out config/validator/new_validator_key.pem
openssl ec -in config/validator/new_validator_key.pem -pubout -out config/validator/new_validator_pub.pem

# Update configuration
# Update genesis.json with new public key
# Restart node
sudo systemctl start synergy-validator

# Contact network administrators about key change
```

---

## 📈 Performance Optimization

### System Tuning

```bash
# Optimize kernel parameters
sudo tee /etc/sysctl.d/99-synergy.conf > /dev/null <<EOF
# Increase limits for better performance
fs.file-max = 65536
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.unix.max_dgram_qlen = 1000

# TCP optimization
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_fin_timeout = 30
EOF

sudo sysctl -p /etc/sysctl.d/99-synergy.conf

# Increase file limits for synergy user
sudo tee /etc/security/limits.d/synergy.conf > /dev/null <<EOF
synergy soft nofile 65536
synergy hard nofile 65536
synergy soft nproc 4096
synergy hard nproc 4096
EOF
```

### Application Tuning

```toml
# config/network-config.toml - Performance settings
[performance]
max_connections = 100
max_block_size = 2097152  # 2MB
max_tx_pool_size = 2000
enable_compression = true
compression_level = 6

[cache]
block_cache_size = 134217728  # 128MB
tx_cache_size = 67108864      # 64MB
state_cache_size = 268435456  # 256MB
```

---

## 🔒 Security Best Practices

### Network Security

1. **Use firewalls** to restrict access to necessary ports only
2. **Monitor** for unusual network activity
3. **Keep software updated** to patch security vulnerabilities
4. **Use VPN** for administrative access when possible

### Key Management

1. **Store private keys securely** with proper file permissions (600)
2. **Use hardware security modules** for production validators
3. **Backup encrypted** validator keys offline
4. **Never share** private keys or seed phrases

### Operational Security

1. **Monitor logs** for suspicious activity
2. **Set up alerts** for node downtime or performance issues
3. **Regular security audits** of your infrastructure
4. **Use fail2ban** to prevent brute force attacks

---

## 🤝 Validator Community

### Communication Channels

- **Discord**: [Synergy Network Discord](https://discord.gg/synergy)
- **Forum**: [Synergy Network Forum](https://forum.synergy.network)
- **Telegram**: [Synergy Validators](https://t.me/synergy_validators)
- **GitHub**: [Issues and Discussions](https://github.com/synergy-network/testnet)

### Best Practices

1. **Stay active** in community discussions
2. **Share knowledge** and help other validators
3. **Report issues** promptly and professionally
4. **Participate in governance** proposals
5. **Maintain transparency** about your operations

### Incentives and Rewards

Validators earn rewards through:

- **Block production rewards** (synergy points)
- **Transaction fees** from included transactions
- **Uptime bonuses** for consistent availability
- **Community contributions** and collaborative efforts

---

## 📚 Additional Resources

- [API Reference](api-reference.md) - Complete RPC API documentation
- [Configuration Guide](config-guide.md) - Detailed configuration options
- [Troubleshooting Guide](troubleshooting.md) - Solutions to common problems
- [Development Guide](../README.md) - Contributing to the codebase

---

*Happy validating! 🎉 Your participation strengthens the Synergy Network and helps build a more decentralized future.*
