# Synergy Validator Control Panel

A professional desktop application for managing Synergy Network validators. This Electron-based application provides a complete interface for validator setup, monitoring, and management across Windows, macOS, and Linux platforms.

## 🚀 Features

- **Validator Setup Wizard** - Guided setup process for new validators
- **Real-time Monitoring** - Live dashboard showing validator performance metrics
- **Multi-platform Support** - Native installers for Windows, macOS, and Linux
- **Synergy Network Integration** - Connect to testnet RPC endpoints
- **Professional UI** - Material Design interface with Synergy Network branding
- **Secure Architecture** - Context isolation and security best practices

## 📋 Prerequisites

### System Requirements
- **Windows**: Windows 10 or later (64-bit)
- **macOS**: macOS 10.12 or later (Intel or Apple Silicon)
- **Linux**: Ubuntu 18.04+, Debian 10+, or similar modern distributions

### Software Requirements
- **Node.js** 16.0.0 or later
- **npm** 8.0.0 or later
- **Git** (for cloning the repository)

## 🛠️ Installation & Setup

### 1. Clone or Download

```bash
# Clone the repository
git clone <repository-url>
cd synergy-validator-control-panel

# Or download and extract the project files
```

### 2. Install Dependencies

```bash
# Install all required packages
npm install
```

This will install:
- Electron framework
- React and Material-UI for the interface
- Development tools (concurrently, wait-on)
- Build tools (electron-builder)

## 🎮 Running the Application

### Development Mode

For development with hot-reload and debugging:

```bash
# Start the application in development mode
npm run dev
```

This will:
- Start the React development server on `http://localhost:3000`
- Launch Electron with DevTools enabled
- Enable hot-reload for UI changes

### Production Mode

For testing the built application:

```bash
# Build and run in production mode
npm start
```

### Alternative Development Commands

```bash
# Run only the React development server
npm run dev:react

# Build the React app for production
npm run build:react

# Run Electron directly (for testing)
ELECTRON_IS_DEV=false electron .
```

## 📦 Building for Distribution

### Build for All Platforms

```bash
# Build installers for Windows, macOS, and Linux
npm run build
```

### Platform-Specific Builds

#### macOS (DMG)
```bash
# Build for macOS (Intel + Apple Silicon)
npm run build:mac
# or
npm run dist:mac
```

**Output**: `dist/Synergy Validator Control Panel-1.0.0.dmg`

#### Windows (NSIS Installer)
```bash
# Build for Windows (64-bit and 32-bit)
npm run build:win
# or
npm run dist:win
```

**Output**: `dist/Synergy Validator Control Panel Setup 1.0.0.exe`

#### Linux (AppImage)
```bash
# Build for Linux (64-bit)
npm run build:linux
# or
npm run dist:linux
```

**Output**: `dist/Synergy Validator Control Panel-1.0.0.AppImage`

## 💿 Installation

### macOS Installation

1. **Download** the `.dmg` file from the `dist/` folder
2. **Double-click** the `.dmg` file to mount it
3. **Drag** the "Synergy Validator Control Panel" app to your Applications folder
4. **Launch** the app from Applications or Spotlight

### Windows Installation

1. **Download** the `.exe` installer from the `dist/` folder
2. **Run** the installer (`Synergy Validator Control Panel Setup 1.0.0.exe`)
3. **Follow** the installation wizard
4. **Launch** from the Start Menu or Desktop shortcut

### Linux Installation

1. **Download** the `.AppImage` file from the `dist/` folder
2. **Make it executable**:
   ```bash
   chmod +x "Synergy Validator Control Panel-1.0.0.AppImage"
   ```
3. **Run** the AppImage:
   ```bash
   ./Synergy Validator Control Panel-1.0.0.AppImage
   ```

## 🔧 Using the Validator Control Panel

### First Launch

1. **Launch** the Synergy Validator Control Panel
2. **Complete the setup wizard**:
   - Connect to Synergy testnet RPC
   - Configure validator settings
   - Generate validator keys
   - Register your validator

### Dashboard Features

Once set up, the dashboard provides:

- **Validator Status** - Active/Inactive/Jailed status
- **Performance Metrics** - Synergy score, uptime, blocks produced
- **Rewards Tracking** - Current epoch and total rewards earned
- **Network Information** - Connected validators, network stats
- **Validator Controls** - Start/stop validator operations

### Validator Operations

The control panel allows you to:

- **Monitor validator performance** in real-time
- **Track rewards and earnings**
- **View validator ranking** among all network validators
- **Access detailed metrics** and analytics
- **Manage validator settings** and configuration

## 🛠️ Development

### Project Structure

```
synergy-validator-control-panel/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/           # API and RPC services
│   ├── App.js             # Main application component
│   └── index.js           # React entry point
├── public/                # Static assets and HTML
├── main.js               # Electron main process
├── preload.js            # Electron preload script
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

### Available Scripts

```bash
# Development
npm run dev              # Development mode with hot-reload
npm run dev:react        # React dev server only

# Production builds
npm run build            # Build for all platforms
npm run build:mac        # Build for macOS only
npm run build:win        # Build for Windows only
npm run build:linux      # Build for Linux only

# Distribution (same as build commands)
npm run dist             # Distribute for all platforms
npm run dist:mac         # Distribute for macOS
npm run dist:win         # Distribute for Windows
npm run dist:linux       # Distribute for Linux
```

### Adding New Features

1. **Frontend Changes**: Modify React components in `src/`
2. **Backend Integration**: Update services in `src/services/`
3. **Build Features**: Add new electron-builder configurations
4. **Test**: Run `npm run dev` to test changes

## 🔒 Security & Best Practices

- **Context Isolation**: Enabled for security
- **No Node Integration**: Renderer process is sandboxed
- **Secure IPC**: All communication through secure channels
- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error handling throughout

## 🚨 Troubleshooting

### Common Issues

#### "White Screen" on Launch
- **Cause**: React app not building correctly
- **Solution**: Run `npm run build:react` then `npm run dev`

#### Cannot Connect to Testnet
- **Cause**: Testnet RPC not running or incorrect URL
- **Solution**: Ensure Synergy testnet node is running on `localhost:8545`

#### Build Fails
- **Cause**: Missing dependencies or platform-specific issues
- **Solution**: Run `npm install` and check Node.js version

#### Icon Not Displaying
- **Cause**: Icon file not found or incorrect format
- **Solution**: Ensure `assets/icon.png` exists and is 512x512px

### Platform-Specific Issues

#### macOS
- **Code Signing**: May show security warnings (normal for unsigned apps)
- **Gatekeeper**: Right-click > Open to bypass initial security check

#### Windows
- **Antivirus**: May flag as unknown software (normal for new apps)
- **SmartScreen**: Click "More info" > "Run anyway"

#### Linux
- **Permissions**: Ensure AppImage is executable with `chmod +x`
- **Dependencies**: May need additional libraries for graphics/audio

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section above
- Review the Synergy Network documentation
- Open an issue on the project repository

---

**Built with ❤️ for the Synergy Network community**
