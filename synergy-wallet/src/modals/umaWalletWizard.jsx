import React, { useState } from "react";
import Modal from "./Modal";
import * as bip39 from "bip39";
import { generateDeterministicDilithiumKeypair } from "../utils/pqc";
import {
  generateBTCAddressFromMnemonic,
  generateETHWalletFromMnemonic,
  generateSOLWalletFromMnemonic,
  generateBCHAddressFromMnemonic,
  generateTRXAddressFromMnemonic,
  generateADAAddressFromMnemonic,
  generateXRPAddressFromMnemonic,
  generateDOTAddressFromMnemonic,
  generateATOMAddressFromMnemonic,
  generateNEARAddressFromMnemonic,
  generateSTRKAddressFromMnemonic,
} from "../utils/umaAddresses";
import { pubkeyToSynergyAddress } from "../utils/synergyAddress";
import { toHex } from "../utils/hexUtils";
import { useNavigate } from "react-router-dom";

const SEED_WORD_OPTIONS = [12, 24];

const Steps = {
  MODE: 0,
  CREATE_CHOOSE_LENGTH: 1,
  CREATE_REVEAL: 2,
  CREATE_VERIFY: 3,
  CREATE_PASSPHRASE: 4,
  PASSWORD: 5,
  SECURITY_SETUP: 6,
  BACKUP_PLAN: 7,
  SNS: 8,
  COMPLETE: 9,
  IMPORT_CHOOSE_LENGTH: 10,
  IMPORT_ENTRY: 11,
  IMPORT_PASSPHRASE: 12
};

export default function UmaWalletWizard({ isOpen, onClose, onWalletCreated }) {
  const [step, setStep] = useState(Steps.MODE);
  const [mode, setMode] = useState("create");
  const [seedLength, setSeedLength] = useState(12);
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [enteredSeedPhrase, setEnteredSeedPhrase] = useState(Array(12).fill(""));
  const [verifyIndexes, setVerifyIndexes] = useState([]);
  const [verifyInputs, setVerifyInputs] = useState([]);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [passphrase2, setPassphrase2] = useState("");
  const [sns, setSNS] = useState("");
  const [snsSkip, setSNSSkip] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [seedPhraseConfirmed, setSeedPhraseConfirmed] = useState(false);
  const [passphraseConfirmed, setPassphraseConfirmed] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  // Enhanced security options
  const [securityLevel, setSecurityLevel] = useState("enhanced"); // basic, enhanced, maximum
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [enableTimelock, setEnableTimelock] = useState(false);
  const [timelockHours, setTimelockHours] = useState(24);
  const [enableMultiDevice, setEnableMultiDevice] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const navigate = useNavigate();

  // Crypto helper functions
  const sha256 = async (data) => {
    const encoder = new TextEncoder();
    const dataBytes = typeof data === 'string' ? encoder.encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    return new Uint8Array(hashBuffer);
  };

  const hkdf = async (ikm, salt, info = new Uint8Array(), length = 32) => {
    const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      key,
      length * 8
    );
    return new Uint8Array(derived);
  };

  const deriveKeyPBKDF2 = async (password, salt, iterations = 200000) => {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const baseKey = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-512' },
      baseKey,
      256
    );
    return new Uint8Array(derived);
  };

  const aesGcmEncrypt = async (keyBytes, plaintext) => {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );
    return {
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      ciphertext: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  };

  const generateDeviceSecret = async () => {
    // Create a device-bound secret using available browser APIs
    const timestamp = Date.now();
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Safely access screen properties
    let screenInfo = "unknown";
    try {
      if (typeof window !== 'undefined' && window.screen) {
        screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      }
    } catch (e) {
      // Fallback if screen is not accessible
      screenInfo = "fallback";
    }

    const deviceFingerprint = `${userAgent}-${language}-${timezone}-${screenInfo}`;
    const deviceBytes = await sha256(deviceFingerprint + timestamp);

    // Store a device identifier for this session
    const deviceId = Array.from(deviceBytes.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('');

    return { deviceBytes, deviceId };
  };

  // Navigation functions
  const totalSteps = mode === "create"
    ? [Steps.MODE, Steps.CREATE_CHOOSE_LENGTH, Steps.CREATE_REVEAL, Steps.CREATE_VERIFY,
    Steps.CREATE_PASSPHRASE, Steps.PASSWORD, Steps.SECURITY_SETUP, Steps.BACKUP_PLAN, Steps.SNS, Steps.COMPLETE]
    : [Steps.MODE, Steps.IMPORT_CHOOSE_LENGTH, Steps.IMPORT_ENTRY, Steps.IMPORT_PASSPHRASE,
    Steps.PASSWORD, Steps.SECURITY_SETUP, Steps.SNS, Steps.COMPLETE];

  const progressSteps = totalSteps.filter(step => step !== Steps.MODE);
  const progress = progressSteps.indexOf(step) / (progressSteps.length - 1);

  const randomUniqueIndexes = (n, max) => {
    const set = new Set();
    while (set.size < n) set.add(Math.floor(Math.random() * max));
    return Array.from(set).sort((a, b) => a - b);
  };

  const handleModeSelect = (m) => {
    setMode(m);
    setStep(m === "create" ? Steps.CREATE_CHOOSE_LENGTH : Steps.IMPORT_CHOOSE_LENGTH);
    setError("");
  };

  const handleSeedLengthSelect = (len) => {
    setSeedLength(len);
    setSeedPhrase([]);
    setEnteredSeedPhrase(Array(len).fill(""));
    setError("");
    if (mode === "create") {
      const entropyBits = len === 12 ? 128 : 256;
      const phrase = bip39.generateMnemonic(entropyBits);
      setSeedPhrase(phrase.split(" "));
      setStep(Steps.CREATE_REVEAL);
    } else {
      setStep(Steps.IMPORT_ENTRY);
    }
  };

  const handleRevealContinue = () => {
    const verifyWordsCount = seedLength === 12 ? 3 : 6;
    setVerifyIndexes(randomUniqueIndexes(verifyWordsCount, seedLength));
    setVerifyInputs(Array(verifyWordsCount).fill(""));
    setStep(Steps.CREATE_VERIFY);
    setError("");
  };

  const handleVerifyContinue = () => {
    let correct = true;
    verifyIndexes.forEach((idx, i) => {
      if (verifyInputs[i].trim().toLowerCase() !== seedPhrase[idx]) {
        correct = false;
      }
    });
    if (!correct) {
      setError("One or more words do not match. Please try again.");
      return;
    }
    setError("");
    setStep(Steps.CREATE_PASSPHRASE);
  };

  const handlePassphraseContinue = () => {
    if (!passphrase) {
      setError("Passphrase is required for enhanced security.");
      return;
    }
    if (passphrase !== passphrase2) {
      setError("Passphrases do not match.");
      return;
    }
    if (passphrase.length < 8) {
      setError("Passphrase should be at least 8 characters for security.");
      return;
    }
    setError("");
    setStep(Steps.PASSWORD);
  };

  const handleValidateImport = () => {
    const phrase = enteredSeedPhrase.join(" ").toLowerCase();
    if (!bip39.validateMnemonic(phrase)) {
      setError("Invalid BIP39 seed phrase.");
      return;
    }
    setSeedPhrase(enteredSeedPhrase.map(w => w.trim().toLowerCase()));
    setError("");
    setStep(Steps.IMPORT_PASSPHRASE);
  };

  const handlePasswordContinue = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(Steps.SECURITY_SETUP);
  };

  const handleSecuritySetupContinue = () => {
    setError("");
    if (mode === "create") {
      setStep(Steps.BACKUP_PLAN);
    } else {
      setStep(Steps.SNS);
    }
  };

  const handleBackupPlanContinue = () => {
    setError("");
    setStep(Steps.SNS);
  };

  const handleFinalizeWallet = async () => {
    setError("");
    setProcessing(true);

    try {
      // 1. Create base seed with passphrase
      const mnemonicString = seedPhrase.join(" ");
      const baseSeed = bip39.mnemonicToSeedSync(mnemonicString, passphrase);

      // 2. Generate device secret
      const { deviceBytes, deviceId } = await generateDeviceSecret();

      // 3. Create enhanced seed using HKDF
      const salt = await sha256(deviceBytes);
      const info = new TextEncoder().encode(`synergy-wallet-v1-${securityLevel}`);
      const enhancedSeed = await hkdf(new Uint8Array(baseSeed), salt, info, 64);

      // 4. Generate PQC keys from enhanced seed
      const { publicKey, privateKey } = await generateDeterministicDilithiumKeypair(enhancedSeed);

      // 5. Generate blockchain addresses (with passphrase)
      const btc = generateBTCAddressFromMnemonic(mnemonicString, passphrase);
      const eth = generateETHWalletFromMnemonic(mnemonicString, passphrase);
      const sol = generateSOLWalletFromMnemonic(mnemonicString, passphrase);
      const bch = generateBCHAddressFromMnemonic(mnemonicString, passphrase);
      const trx = generateTRXAddressFromMnemonic(mnemonicString, passphrase);
      const ada = generateADAAddressFromMnemonic(mnemonicString, passphrase);
      const xrp = generateXRPAddressFromMnemonic(mnemonicString, passphrase);
      const dot = generateDOTAddressFromMnemonic(mnemonicString, passphrase);
      const atom = generateATOMAddressFromMnemonic(mnemonicString, passphrase);
      const near = generateNEARAddressFromMnemonic(mnemonicString, passphrase);
      const strk = generateSTRKAddressFromMnemonic(mnemonicString, passphrase);
      const synergyAddress = await pubkeyToSynergyAddress(publicKey);

      // 6. Create strong encryption key from password
      const encSalt = crypto.getRandomValues(new Uint8Array(32));
      const encKey = await deriveKeyPBKDF2(password, encSalt, 300000);

      // 7. Encrypt sensitive data
      const mnemonicEnc = await aesGcmEncrypt(encKey, mnemonicString);
      const pqcPrivateKeyEnc = await aesGcmEncrypt(encKey, toHex(privateKey));
      const passphraseEnc = await aesGcmEncrypt(encKey, passphrase);

      // 8. Create wallet object with enhanced metadata
      const walletObj = {
        id: "wlt_" + Date.now(),
        label: sns && !snsSkip ? `${sns}.syn` : "Synergy Wallet",
        version: "2.0",
        synergyAddress,
        pqcPublicKey: toHex(publicKey),
        pqcPrivateKeyEnc,
        mnemonicEnc,
        passphraseEnc, // Encrypted passphrase for recovery hints
        bitcoinAddress: btc.address,
        ethereumAddress: eth.address,
        solanaAddress: sol.address,
        bitcoinCashAddress: bch.address,
        tronAddress: trx.address,
        cardanoAddress: ada.address,
        rippleAddress: xrp.address,
        polkadotAddress: dot.address,
        cosmosAddress: atom.address,
        nearAddress: near.address,
        starknetAddress: strk.address,
        networks: ["synergy", "bitcoin", "ethereum", "solana", "bitcoin-cash", "tron", "cardano", "ripple", "polkadot", "cosmos", "near", "starknet"],

        // Security metadata
        securityLevel,
        deviceId,
        encSalt: Array.from(encSalt).map(b => b.toString(16).padStart(2, '0')).join(''),
        kdfIterations: 300000,

        // Enhanced security features
        biometricEnabled: enableBiometric,
        timelockEnabled: enableTimelock,
        timelockHours: enableTimelock ? timelockHours : null,
        multiDeviceEnabled: enableMultiDevice,
        recoveryEmail: recoveryEmail || null,

        createdAt: new Date().toISOString(),
        backupStatus: "not_backed_up",
        sns: sns && !snsSkip ? sns : null,
      };

      // Clear sensitive memory
      enhancedSeed.fill(0);
      encKey.fill(0);

      if (onWalletCreated) onWalletCreated(walletObj);
      setStep(Steps.COMPLETE);

    } catch (err) {
      console.error(err);
      setError("Wallet creation failed: " + (err.message || err));
    }

    setProcessing(false);
  };

  const handleComplete = () => {
    setError("");
    if (onClose) onClose();
    // Don't navigate automatically - let the parent component handle it
  };

  const renderProgressBar = () => (
    <div style={{ width: "100%", margin: "0 0 16px 0" }}>
      <div style={{
        height: 8,
        background: "#eee",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          width: `${Math.round(progress * 100)}%`,
          background: "#3070ea",
          height: "100%",
          transition: "width 0.4s",
        }} />
      </div>
      <div style={{
        textAlign: "right",
        fontSize: 12,
        color: "#999",
        marginTop: 2,
      }}>
        Step {progressSteps.indexOf(step) + 1} of {progressSteps.length}
      </div>
    </div>
  );

  const renderModeStep = () => (
    <div>
      <h2>Add New Wallet</h2>
      <p>Create a new wallet or import an existing one.</p>
      <div style={{ display: "flex", gap: 20, margin: "24px 0", justifyContent: "center" }}>
        <button
          className="sidebar-button"
          onClick={() => handleModeSelect("create")}
          style={{ width: "250px", margin: "10px 0" }}
        >
          Create New Wallet
        </button>
        <button
          className="sidebar-button"
          onClick={() => handleModeSelect("import")}
          style={{ width: "250px", margin: "10px 0" }}
        >
          Import Wallet
        </button>
      </div>
    </div>
  );

  const renderChooseLengthStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Select Seed Phrase Length</h3>
      <div style={{ display: "flex", gap: 20, margin: "24px 0", justifyContent: "center" }}>
        {SEED_WORD_OPTIONS.map((opt) => (
          <button
            key={opt}
            className="sidebar-button"
            onClick={() => handleSeedLengthSelect(opt)}
            style={{ width: "150px", margin: "10px 0" }}
          >
            {opt} words
          </button>
        ))}
      </div>
    </div>
  );

  const renderRevealStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Your Recovery Phrase</h3>
      <p style={{ textAlign: "center" }}>Write down these {seedLength} words in order and keep them safe!</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
        gap: "12px",
        margin: "18px auto",
        width: "100%",
        justifyItems: "stretch"
      }}>
        {seedPhrase.map((word, idx) => {
          // Calculate the correct display number (column-wise numbering)
          const displayNumber = seedLength === 12
            ? (idx % 3) * 4 + Math.floor(idx / 3) + 1  // 3 columns, 4 rows
            : (idx % 6) * 4 + Math.floor(idx / 6) + 1; // 6 columns, 4 rows

          return (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px",
              background: "var(--code-bg)",
              borderRadius: "4px",
              border: "1px solid var(--divider)",
              minHeight: "48px",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: "20px" }}>
                {displayNumber}.
              </span>
              <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)" }}>{word}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={seedPhraseConfirmed}
            onChange={(e) => {
              if (e.target.checked) {
                setShowDisclaimerModal(true);
              } else {
                setSeedPhraseConfirmed(false);
              }
            }}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: "14px", color: "var(--text)" }}>
            I have securely written down my seed phrase
          </span>
        </label>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Verify Your Seed Phrase</h3>
      <p style={{ textAlign: "center" }}>Fill in the missing words:</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
        gap: "12px",
        margin: "18px auto",
        width: "100%",
        justifyItems: "stretch"
      }}>
        {seedPhrase.map((word, idx) => {
          const isMissing = verifyIndexes.includes(idx);
          const verifyIndex = verifyIndexes.indexOf(idx);

          // Calculate the correct display number (column-wise numbering)
          const displayNumber = seedLength === 12
            ? (idx % 3) * 4 + Math.floor(idx / 3) + 1  // 3 columns, 4 rows
            : (idx % 6) * 4 + Math.floor(idx / 6) + 1; // 6 columns, 4 rows

          return (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px",
              background: "var(--code-bg)",
              borderRadius: "4px",
              border: "1px solid var(--divider)",
              minHeight: "48px",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: "20px" }}>
                {displayNumber}.
              </span>
              {isMissing ? (
                <input
                  style={{
                    flex: 1,
                    padding: 0,
                    margin: 0,
                    fontSize: 14,
                    fontWeight: "bold",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text)",
                    minWidth: 0,
                    width: "100%"
                  }}
                  type="text"
                  autoComplete="off"
                  value={verifyInputs[verifyIndex] || ""}
                  onChange={(e) => {
                    const arr = [...verifyInputs];
                    arr[verifyIndex] = e.target.value;
                    setVerifyInputs(arr);
                  }}
                />
              ) : (
                <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)", flex: 1 }}>{word}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPassphraseStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Security Passphrase</h3>
      <div style={{ backgroundColor: "#fff3cd", padding: "12px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #ffeaa7" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
          <strong>Important:</strong> This passphrase combines with your seed phrase to create your wallet.
          Without both the seed phrase AND this passphrase, your wallet cannot be recovered.
        </p>
      </div>

      <input
        style={{ width: "100%", margin: "10px 0", padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
        type="password"
        placeholder="Enter security passphrase"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
      />
      <input
        style={{ width: "100%", margin: "10px 0", padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
        type="password"
        placeholder="Confirm passphrase"
        value={passphrase2}
        onChange={(e) => setPassphrase2(e.target.value)}
      />

      <label style={{ display: "flex", alignItems: "center", marginTop: "16px", gap: "8px" }}>
        <input
          type="checkbox"
          checked={passphraseConfirmed}
          onChange={(e) => setPassphraseConfirmed(e.target.checked)}
        />
        <span style={{ fontSize: "14px", color: "var(--text)" }}>
          I understand that losing this passphrase means permanent loss of wallet access
        </span>
      </label>
    </div>
  );

  const renderPasswordStep = () => (
    <div>
      <h3>Create Device Password</h3>
      <p>This password encrypts your wallet on this device.</p>
      <input
        style={{ width: "100%", margin: "10px 0", padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        style={{ width: "100%", margin: "10px 0", padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
        type="password"
        placeholder="Confirm password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
      />
    </div>
  );

  const renderSecuritySetupStep = () => (
    <div>
      <h3 style={{ textAlign: "center", color: "var(--text)" }}>Security Configuration</h3>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "16px", fontWeight: "bold", display: "block", marginBottom: "10px", color: "var(--text)" }}>
          Security Level:
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { value: "basic", label: "Basic", desc: "Standard encryption" },
            { value: "enhanced", label: "Enhanced", desc: "Device binding + stronger encryption" },
            { value: "maximum", label: "Maximum", desc: "All security features enabled" }
          ].map(level => (
            <label key={level.value} style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: securityLevel === level.value ? "2px solid #3070ea" : "1px solid var(--divider)",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "var(--text)"
            }}>
              <input
                type="radio"
                name="securityLevel"
                value={level.value}
                checked={securityLevel === level.value}
                onChange={(e) => setSecurityLevel(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              <div>
                <div style={{ fontWeight: "bold", color: "var(--text)" }}>{level.label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{level.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px", borderRadius: "8px", marginTop: "16px", border: "1px solid var(--divider)" }}>
        <h4 style={{ color: "var(--text)" }}>Additional Security Options:</h4>

        <label style={{ display: "flex", alignItems: "center", margin: "12px 0", gap: "8px", color: securityLevel === "basic" ? "var(--text-muted)" : "var(--text)" }}>
          <input
            type="checkbox"
            checked={enableTimelock}
            disabled={securityLevel === "basic"}
            onChange={(e) => setEnableTimelock(e.target.checked)}
          />
          <span>Enable transaction time delays for large amounts</span>
        </label>

        <div style={{ marginLeft: "24px", marginBottom: "12px" }}>
          <label style={{ color: enableTimelock && securityLevel !== "basic" ? "var(--text)" : "var(--text-muted)" }}>Delay period: </label>
          <select
            value={timelockHours}
            disabled={!enableTimelock || securityLevel === "basic"}
            onChange={(e) => setTimelockHours(Number(e.target.value))}
            style={{
              padding: "4px",
              marginLeft: "8px",
              backgroundColor: "var(--bg)",
              color: enableTimelock && securityLevel !== "basic" ? "var(--text)" : "var(--text-muted)",
              border: "1px solid var(--divider)",
              opacity: enableTimelock && securityLevel !== "basic" ? 1 : 0.6
            }}
          >
            <option value={1}>1 hour</option>
            <option value={24}>24 hours</option>
            <option value={72}>72 hours</option>
          </select>
        </div>

        <label style={{ display: "flex", alignItems: "center", margin: "12px 0", gap: "8px", color: securityLevel === "basic" ? "var(--text-muted)" : "var(--text)" }}>
          <input
            type="checkbox"
            checked={enableMultiDevice}
            disabled={securityLevel === "basic"}
            onChange={(e) => setEnableMultiDevice(e.target.checked)}
          />
          <span>Enable multi-device recovery options</span>
        </label>

        <div style={{ marginLeft: "24px", marginBottom: "12px" }}>
          <input
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid var(--divider)",
              backgroundColor: "var(--bg)",
              color: enableMultiDevice && securityLevel !== "basic" ? "var(--text)" : "var(--text-muted)",
              opacity: enableMultiDevice && securityLevel !== "basic" ? 1 : 0.6
            }}
            type="email"
            placeholder="Recovery email (optional)"
            value={recoveryEmail}
            disabled={!enableMultiDevice || securityLevel === "basic"}
            onChange={(e) => setRecoveryEmail(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderBackupPlanStep = () => (
    <div>
      <h3>Backup & Recovery Plan</h3>
      <div style={{ backgroundColor: "#d1ecf1", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #bee5eb" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#0c5460" }}>Your Recovery Requirements:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#0c5460" }}>
          <li>12-word seed phrase (written down securely)</li>
          <li>Security passphrase (memorized or stored separately)</li>
          {securityLevel !== "basic" && <li>Access to this device or recovery email</li>}
          <li>Device password (for local access)</li>
        </ul>
      </div>

      <div style={{ backgroundColor: "#f8d7da", padding: "16px", borderRadius: "8px", border: "1px solid #f5c6cb" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#721c24" }}>Critical Warnings:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#721c24" }}>
          <li>If you lose your seed phrase AND passphrase, your funds are gone forever</li>
          <li>Store your seed phrase and passphrase in different secure locations</li>
          <li>Never store both together digitally (photos, cloud storage, etc.)</li>
          <li>Test your backup by doing a practice recovery</li>
        </ul>
      </div>
    </div>
  );

  const renderSNSStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Create Your SNS Handle</h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "30px 0 20px 0" }}>
        <input
          style={{ padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
          type="text"
          placeholder="Enter a unique SNS handle..."
          value={sns}
          onChange={(e) => setSNS(e.target.value)}
        />
        <span style={{ fontSize: 16, color: "var(--text)" }}>.syn</span>
      </div>
      {sns && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)" }}>
            Your new Synergy Naming System handle is...
          </p>
          <p style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "bold", color: "var(--text)" }}>
            {sns.toLowerCase()}.syn
          </p>
          <div style={{ backgroundColor: "var(--code-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--divider)", textAlign: "left", maxWidth: "500px", margin: "0 auto" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "var(--text)" }}>What is an SNS Handle?</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              <li>Your unique identity on the Synergy Network</li>
              <li>Replaces complex wallet addresses with human-readable names</li>
              <li>Enables easy sending and receiving of assets</li>
              <li>Works across all supported blockchain networks</li>
              <li>Permanent and cannot be changed once created</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderImportEntryStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Enter Your Seed Phrase</h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
        gap: "12px",
        margin: "18px auto",
        width: "100%",
        justifyItems: "stretch"
      }}>
        {enteredSeedPhrase.map((word, idx) => {
          // Calculate the correct display number (column-wise numbering)
          const displayNumber = seedLength === 12
            ? (idx % 3) * 4 + Math.floor(idx / 3) + 1  // 3 columns, 4 rows
            : (idx % 6) * 4 + Math.floor(idx / 6) + 1; // 6 columns, 4 rows

          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", boxSizing: "border-box" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: "20px" }}>
                {displayNumber}.
              </span>
              <input
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: 14,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  outline: "none"
                }}
                type="text"
                autoComplete="off"
                value={word}
                onChange={(e) => {
                  const arr = [...enteredSeedPhrase];
                  arr[idx] = e.target.value.replace(/\s/g, "");
                  setEnteredSeedPhrase(arr);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderImportPassphraseStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Enter Security Passphrase</h3>
      <p style={{ textAlign: "center", marginBottom: "16px" }}>
        Enter the passphrase that was used when this wallet was created.
      </p>

      <input
        style={{ width: "100%", margin: "10px 0", padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
        type="password"
        placeholder="Enter security passphrase"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
      />

      <div style={{ backgroundColor: "#fff3cd", padding: "12px", borderRadius: "8px", marginTop: "16px", border: "1px solid #ffeaa7" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
          If this wallet was created with enhanced security, you may need access to the original device or recovery options.
        </p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div style={{ textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
      <h2>Wallet Setup Complete!</h2>
      <div style={{ backgroundColor: "#d4edda", padding: "16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #c3e6cb" }}>
        <p style={{ margin: 0, color: "#155724" }}>
          Your secure Synergy wallet has been created with enhanced protection.
          Remember to store your seed phrase and passphrase in separate, secure locations.
        </p>
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          className="sidebar-button"
          onClick={handleComplete}
          style={{ width: "120px", margin: "10px 0" }}
        >
          Close
        </button>
      </div>
    </div>
  );

  // Navigation helpers
  const getBackStep = () => {
    switch (step) {
      case Steps.CREATE_CHOOSE_LENGTH:
      case Steps.IMPORT_CHOOSE_LENGTH:
        return Steps.MODE;
      case Steps.CREATE_REVEAL:
        return Steps.CREATE_CHOOSE_LENGTH;
      case Steps.CREATE_VERIFY:
        return Steps.CREATE_REVEAL;
      case Steps.CREATE_PASSPHRASE:
        return Steps.CREATE_VERIFY;
      case Steps.IMPORT_ENTRY:
        return Steps.IMPORT_CHOOSE_LENGTH;
      case Steps.IMPORT_PASSPHRASE:
        return Steps.IMPORT_ENTRY;
      case Steps.PASSWORD:
        return mode === "create" ? Steps.CREATE_PASSPHRASE : Steps.IMPORT_PASSPHRASE;
      case Steps.SECURITY_SETUP:
        return Steps.PASSWORD;
      case Steps.BACKUP_PLAN:
        return Steps.SECURITY_SETUP;
      case Steps.SNS:
        return mode === "create" ? Steps.BACKUP_PLAN : Steps.SECURITY_SETUP;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case Steps.CREATE_REVEAL:
        return seedPhraseConfirmed;
      case Steps.CREATE_VERIFY:
        return verifyInputs.every(input => input.trim() !== "");
      case Steps.CREATE_PASSPHRASE:
        return passphrase && passphrase === passphrase2 && passphraseConfirmed;
      case Steps.IMPORT_ENTRY:
        return enteredSeedPhrase.every(word => word.trim() !== "");
      case Steps.IMPORT_PASSPHRASE:
        return passphrase.length > 0;
      case Steps.PASSWORD:
        return password && password === password2 && password.length >= 8;
      default:
        return true;
    }
  };

  const handleNext = () => {
    switch (step) {
      case Steps.CREATE_REVEAL:
        handleRevealContinue();
        break;
      case Steps.CREATE_VERIFY:
        handleVerifyContinue();
        break;
      case Steps.CREATE_PASSPHRASE:
        handlePassphraseContinue();
        break;
      case Steps.IMPORT_ENTRY:
        handleValidateImport();
        break;
      case Steps.IMPORT_PASSPHRASE:
        setStep(Steps.PASSWORD);
        break;
      case Steps.PASSWORD:
        handlePasswordContinue();
        break;
      case Steps.SECURITY_SETUP:
        handleSecuritySetupContinue();
        break;
      case Steps.BACKUP_PLAN:
        handleBackupPlanContinue();
        break;
      case Steps.SNS:
        handleFinalizeWallet();
        break;
    }
  };

  const getNextButtonText = () => {
    switch (step) {
      case Steps.SNS:
        return processing ? "Creating..." : "Create Wallet";
      default:
        return "Next";
    }
  };

  // Main render
  const renderCurrentStep = () => {
    switch (step) {
      case Steps.MODE:
        return renderModeStep();
      case Steps.CREATE_CHOOSE_LENGTH:
      case Steps.IMPORT_CHOOSE_LENGTH:
        return renderChooseLengthStep();
      case Steps.CREATE_REVEAL:
        return renderRevealStep();
      case Steps.CREATE_VERIFY:
        return renderVerifyStep();
      case Steps.CREATE_PASSPHRASE:
        return renderPassphraseStep();
      case Steps.IMPORT_ENTRY:
        return renderImportEntryStep();
      case Steps.IMPORT_PASSPHRASE:
        return renderImportPassphraseStep();
      case Steps.PASSWORD:
        return renderPasswordStep();
      case Steps.SECURITY_SETUP:
        return renderSecuritySetupStep();
      case Steps.BACKUP_PLAN:
        return renderBackupPlanStep();
      case Steps.SNS:
        return renderSNSStep();
      case Steps.COMPLETE:
        return renderCompleteStep();
      default:
        return <div>Unknown step</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Universal Wallet Wizard">
      <div style={{ width: "600px", padding: 20, minHeight: "500px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          {renderCurrentStep()}
        </div>
        {step !== Steps.MODE && step !== Steps.COMPLETE && (
          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            {renderProgressBar()}
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              marginTop: "24px"
            }}>
              <button
                className="sidebar-button"
                onClick={() => setStep(getBackStep())}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  minWidth: "100px"
                }}
              >
                Back
              </button>

              <button
                className="sidebar-button"
                onClick={handleNext}
                disabled={!canProceed() || processing}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  minWidth: "140px",
                  opacity: canProceed() && !processing ? 1 : 0.6,
                  cursor: canProceed() && !processing ? "pointer" : "not-allowed"
                }}
              >
                {getNextButtonText()}
              </button>
            </div>
          </div>
        )}
        {processing && (
          <div style={{ marginTop: 12, color: "var(--text-muted)", textAlign: "center" }}>
            Creating wallet, please wait...
          </div>
        )}
        {error && <div style={{ color: "#ff477b", marginTop: 10, textAlign: "center" }}>{error}</div>}
      </div>

      {/* Security Disclaimer Modal */}
      {showDisclaimerModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "var(--bg)",
            padding: "32px",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            border: "1px solid var(--divider)"
          }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#dc3545" }}>
              ⚠️ Critical Security Information
            </h3>
            <div style={{ lineHeight: "1.6", marginBottom: "24px", color: "var(--text)" }}>
              <p style={{ marginBottom: "16px" }}>
                <strong>Your seed phrase + passphrase are the master keys to your wallet.</strong>
                This enhanced security means both are required for recovery.
              </p>
              <p style={{ marginBottom: "16px" }}>
                <strong>Store securely & separately:</strong> Keep your seed phrase and passphrase
                in different secure locations (never together digitally).
              </p>
              <p style={{ marginBottom: "16px" }}>
                <strong>No recovery without both:</strong> If you lose either your seed phrase
                OR your passphrase, your funds may be permanently lost.
              </p>
              <p style={{ marginBottom: "16px" }}>
                <strong>Test your backup:</strong> After setup, practice recovering your wallet
                to ensure you have everything needed.
              </p>
              <p style={{ color: "#dc3545", fontWeight: "bold" }}>
                Synergy Network cannot recover lost seed phrases or passphrases.
                You are fully responsible for their security.
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <button
                className="sidebar-button"
                onClick={() => {
                  setShowDisclaimerModal(false);
                  setSeedPhraseConfirmed(true);
                }}
                style={{
                  padding: "12px 32px",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                I Understand the Risks
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
