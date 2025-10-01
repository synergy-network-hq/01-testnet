# Synergy Network Testnet - Developer Guide

## 🚀 Overview

The **Synergy Network Testnet** is a cutting-edge blockchain implementation featuring the revolutionary **Proof of Synergy (PoSy)** consensus mechanism. This testnet serves as a proving ground for interoperability, validator behaviors, wallet generation, and comprehensive testing before mainnet launch.

**Proof of Synergy** introduces a paradigm shift in consensus mechanisms by focusing on collaborative validation, community participation, and sustainable network growth rather than pure computational power.

---

## 🏗️ Architecture Highlights

- **🦀 Rust-based**: High-performance, memory-safe blockchain runtime
- **🔗 PoSy Consensus**: Validator clustering with synergy scoring and collaborative rewards
- **📡 Advanced Networking**: Libp2p-based peer-to-peer networking with auto-discovery
- **🗄️ Persistent Storage**: RocksDB for reliable blockchain state management
- **🔐 Post-Quantum Security**: Dilithium-3 digital signatures for future-proof security
- **🌐 JSON-RPC API**: Comprehensive API with WebSocket support
- **📊 Advanced Logging**: Structured logging with rotation and multiple output formats
- **⚙️ Flexible Configuration**: Environment variable overrides and TOML configuration

---

## 🎯 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Proof of Synergy** | Collaborative validator consensus with synergy scoring | ✅ Implemented |
| **Validator Clustering** | Dynamic validator grouping based on performance | ✅ Implemented |
| **VRF Integration** | Verifiable Random Function for fair validator selection | ✅ Implemented |
| **Bech32m Addresses** | Human-readable addresses with SNS/UMA integration | ✅ Implemented |
| **Cross-Chain Support** | Ethereum, Solana, Cosmos, Bitcoin compatibility | ✅ Configured |
| **Advanced RPC** | JSON-RPC 2.0 with comprehensive blockchain queries | ✅ Implemented |
| **Transaction Pool** | Efficient transaction management and validation | ✅ Implemented |
| **P2P Networking** | Auto-discovery and block synchronization | ✅ Basic |
| **Monitoring** | Health checks, metrics, and alerting | ✅ Basic |

---

## 🛠️ Quick Start

### Prerequisites

**System Requirements:**
- Ubuntu 20.04+ / macOS 12+ / Windows 10+ with WSL2
- 4+ CPU cores, 8GB+ RAM, 50GB+ storage
- Stable internet connection

**Install Dependencies:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y build-essential libssl-dev pkg-config curl git

# macOS (with Homebrew)
brew install openssl cmake

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
```

### Clone and Setup

```bash
# Clone repository
git clone https://github.com/synergy-network/testnet.git
cd synergy-testnet

# Initialize configuration
cargo run --release -- init

# Build the node
cargo build --release --bin synergy-testnet

# Verify installation
./target/release/synergy-testnet --version
```

### Start Your Node

```bash
# Start the testnet node
cargo run --release -- start

# Or use the convenience script
bash scripts/start-testnet.sh
```

**Expected Output:**
```
🔧 Synergy Testnet Node Starting...
🔧 Configuration loaded successfully
🔧 Chain loaded. Latest height: 0
🔧 Validator set loaded. Total validators: 3
🔧 Synergy scores loaded. Total entries: 0
⚙️ Executing Proof of Synergy consensus engine...
📡 RPC server running on 0.0.0.0:8545
🧱 New Block Mined!
   Block Height: 1
   Validator: sYnQ1ffzcyq7l0sw7v9fhrx2wdvxxzv9q5mj3ehd6yl3e
   Tx Count: 0
   Block Hash: abc123...
```

### Verify Node Status

```bash
# Check node status
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"synergy_nodeInfo","id":1}' \
  http://localhost:8545

# Check latest block
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"synergy_getLatestBlock","id":1}' \
  http://localhost:8545

# Submit a test transaction
curl -X POST -H "Content-Type: application/json" \
  --data '{
    "jsonrpc":"2.0",
    "method":"synergy_sendTransaction",
    "params":[{
      "sender":"sYnQ1zxy8qhj4j59xp5lwkwpd5qws9aygz8pl9m3kmjx3",
      "receiver":"sYnU1z08h2k6c4gzf0q88dqgwhsm47m52ccqluwqmn0vz",
      "amount":1000,
      "nonce":1,
      "signature":"test_signature_123",
      "gas_price":1,
      "gas_limit":21000
    }],
    "id":1
  }' \
  http://localhost:8545
```

---

## 📁 Repository Structure

```
synergy-testnet/
├── 📁 config/           # Configuration files
│   ├── genesis.json     # Genesis block and network parameters
│   ├── network-config.toml # Network and P2P settings
│   └── node_config.toml # Node-specific configuration
├── 📁 src/              # Source code
│   ├── main.rs         # Application entry point
│   ├── lib.rs          # Library exports
│   ├── block.rs        # Block and blockchain logic
│   ├── transaction.rs  # Transaction handling and validation
│   ├── consensus/      # Proof of Synergy implementation
│   ├── rpc/           # JSON-RPC server
│   ├── p2p/           # Peer-to-peer networking
│   ├── config/        # Configuration management
│   └── logging.rs     # Structured logging system
├── 📁 scripts/         # Automation scripts
│   ├── start-testnet.sh # Node startup script
│   └── stop-testnet.sh  # Node shutdown script
├── 📁 docs/           # This documentation
│   ├── README.md      # This file
│   ├── setup-guide.md # Detailed setup instructions
│   ├── validator-guide.md # Validator setup guide
│   ├── api-reference.md # RPC API documentation
│   ├── config-guide.md # Configuration reference
│   └── troubleshooting.md # Common issues and solutions
├── 📁 data/           # Runtime data (generated)
│   ├── chain.json     # Blockchain state
│   ├── validators.json # Validator registry
│   ├── logs/          # Log files
│   └── chain/         # RocksDB storage
└── 📁 tests/          # Integration and unit tests
```

---

## 🌐 Network Information

- **Network ID**: 7963749
- **Chain ID**: 7963749
- **Genesis Hash**: Available in `config/genesis.json`
- **Block Time**: 5 seconds
- **Consensus**: Proof of Synergy (PoSy)
- **Address Format**: Bech32m (sYn...)
- **RPC Port**: 8545 (HTTP), 8546 (WebSocket)
- **P2P Port**: 30303

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with comprehensive tests
4. **Test** thoroughly (`cargo test`)
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Testing

```bash
# Run all tests
cargo test

# Run specific test module
cargo test consensus

# Run with output
cargo test -- --nocapture

# Benchmark performance
cargo test --release -- --ignored
```

### Code Style

- Use `rustfmt` for consistent formatting
- Follow Rust best practices and idioms
- Add comprehensive documentation
- Include unit tests for new functionality

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🆘 Support

- 📖 **Documentation**: [docs/](./) folder
- 🐛 **Issues**: [GitHub Issues](https://github.com/synergy-network/testnet/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/synergy-network/testnet/discussions)
- 📧 **Email**: dev@synergy.network

---

*Built with ❤️ by the Synergy Network team*
