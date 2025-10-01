# Synergy Network Web Portal

![Synergy Network Logo](/public/images/syn.png)

**Welcome to the Synergy Network Web Portal!**

This portal is the official web interface for the Synergy Network blockchain—a quantum-safe, collaborative, next-generation blockchain platform. The portal provides access to wallet features, Synergy Score dashboard, governance, developer docs, network explorer, and more.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [File/Directory Structure](#filedirectory-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Synergy Score Dashboard](#synergy-score-dashboard)
- [Docs System](#docs-system)
- [Developer Notes](#developer-notes)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

Synergy Network Web Portal serves as the gateway for all user-facing functionality of Synergy Network:

- **Wallet creation & management**
- **Synergy Score dashboard** (gamified reputation and rewards)
- **Network explorer**
- **Docs knowledgebase & developer resources**
- **Governance & DAO participation**
- **Settings & customization**

The codebase is React-based (CRA, but can be migrated to Next.js), with modular components and custom styles.

---

## Key Features

- **Quantum-Safe Wallet Integration**
- **Animated, modular Synergy Score Dashboard**
- **Governance DAO panel**
- **Network Explorer with real blockchain data**
- **Comprehensive Docs Portal (markdown/JSON-powered)**
- **Glassmorphism UI theme (dark mode native)**
- **Extensible component system (React, Chakra UI, Tailwind ready)**
- **API integration-ready (for blockchain, wallets, explorer, governance, etc.)**

---

## File Structure

```markdown
synergy-portal/
├── build/                              # Production build output (auto-generated)
├── public/
│   ├── docs/                           # Static markdown docs (core-concepts, guides, etc.)
│   ├── images/                         # Static images, logos, icons
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── DocSearchBar.js
│   │   ├── DocViewer.js
│   │   ├── layout/
│   │   │   ├── DocSidebar.js
│   │   │   ├── Footer.js
│   │   │   └── Navbar.js
│   │   ├── LoadingScreen.js
│   │   ├── ThemeToggle.js
│   │   ├── WalletOptionsModal.js
│   │   └── pages/
│   │       ├── DashboardPage.js        # Main entry for Synergy Dashboard
│   │       ├── DocsPage.js
│   │       ├── ExplorerPage.js
│   │       ├── GasStationPage.js
│   │       ├── HomePage.js
│   │       ├── IcoPresalePage.js
│   │       ├── SettingsPage.js
│   │       └── WalletPage.js
│   ├── services/
│   │   ├── blockchainService.js        # Blockchain interaction logic
│   │   ├── walletConnectorService.js   # Wallet connection utilities
│   │   └── walletContext.js            # Wallet provider/context
│   ├── styles/
│   │   ├── docs.css
│   │   ├── footer.css
│   │   ├── glassmorphism.css
│   │   ├── index.css
│   │   └── parallax.css
│   ├── App.js
│   ├── index.js
│   └── theme.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md  # ← You're here!
```
Note:

*The docs/ directory in both public and build contains markdown docs for in-app documentation; you can add/edit docs here for instant updates.*

---

## Getting Started

1. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

2. Run the development server:

    ```bash
    npm start
    # or
    yarn start
    #App will be available at http://localhost:3000
    ```

3. Build for production:

    ```bash
    npm run build
    # or
    yarn build
    ```

4. Available Scripts

    ```bash
    npm start #Start development server

    npm run build #Create optimized production build

    npm run lint #Run ESLint checks (if enabled)

    npm test #Run tests (if implemented)
    ```

---

## Synergy Score Dashboard

The **Synergy Score Dashboard** is the central feature for users.

- *Shows your live Synergy Score, percentile, reward progress*
- *Shows contribution history, growth tips, cluster membership, and leaderboard*
- *Modular components: ScoreGauge, ClusterPanel, Leaderboard, RewardsPanel, etc.*
- *Fully animated, glassmorphism design, dark mode by default*

---

## For Devs:

- *Dashboard entry point: src/components/pages/DashboardPage.js*
- *Modular components live under src/components/dashboard/ (to be created for new modular setup)*

---

## Docs System

- *Docs are in markdown files, stored in public/docs/*
- *Index defined in public/docs/docs_index.json*
- *Sidebar, viewer, and search are modular (DocSidebar.js, DocViewer.js, DocSearchBar.js)*
- *To add or edit docs: create .md file in appropriate folder and update docs_index.json*

---

## Developer Notes

- **Written in React (CRA)**, *with modular structure for easy migration to Next.js or other frameworks*
- **Styling**: *mix of vanilla CSS and utility classes (Tailwind, glassmorphism custom styles)*
- **Service Layer**: *Blockchain and wallet logic in src/services/*
- **API integration**: *Use blockchainService.js and hooks for backend or blockchain data*
- **Testing**: *Add tests as needed with Jest/React Testing Library*

---

## Contributing

- Fork the repo and create your feature branch

    ```bash
    git checkout -b feature/my-feature
    ```
- Commit your changes

    ```bash
    git commit -am 'Add new feature'
  ```
- Push to the branch

    ```bash
    git push origin feature/my-feature
    ```

- Open a Pull Request


### Contribution areas:

UI/UX and component development

API and blockchain integration

Docs and tutorials

Bug fixes, testing, QA

---

## License

Licensed under the MIT License.
See LICENSE for details.

---

## Contact

### Website & Email

- Website: https://synergy-network.io

- Support: support@synergy-network.io

- Marketing/Partnerships: marketing@synergy-network.io

- Want to Join the Team?: jobs@synergy-network.io

### Socials

- Twitter/X: [@synergynet](https://x.com/synergynet)

- Discord: [link to be added]


Synergy Network — “Work Together, Win Together.”

---
