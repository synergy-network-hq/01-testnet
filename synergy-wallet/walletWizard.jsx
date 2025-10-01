import React, { useState } from "react";
import * as bip39 from "bip39";

// Mock imports - replace with your actual implementations
const generateDeterministicDilithiumKeypair = async (seed) => {
  // Mock PQC key generation
  return {
    publicKey: new Uint8Array(32),
    privateKey: new Uint8Array(64)
  };
};

const pubkeyToSynergyAddress = async (pubkey) => "syn1..." + Date.now();
const generateBTCAddressFromMnemonic = (mnemonic, passphrase) => ({ address: "1..." });
const generateETHWalletFromMnemonic = (mnemonic, passphrase) => ({ address: "0x..." });
const generateSOLWalletFromMnemonic = (mnemonic, passphrase) => ({ address: "..." });
const toHex = (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

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

export default function SecureWalletWizard({ onWalletCreated }) {
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
    const screen = `${screen.width}x${screen.height}x${screen.colorDepth}`;

    const deviceFingerprint = `${userAgent}-${language}-${timezone}-${screen}`;
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
        networks: ["synergy", "bitcoin", "ethereum", "solana"],

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
      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "20px 0" }} />
      <h2 style={{ textAlign: "center" }}>Get Started</h2>
      <p style={{ textAlign: "center" }}>Create a new wallet or import an existing one.</p>
      <div style={{ display: "flex", gap: 20, margin: "24px 0", justifyContent: "center" }}>
        <button
          onClick={() => handleModeSelect("create")}
          style={{
            width: "200px",
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#3070ea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Create New Wallet
        </button>
        <button
          onClick={() => handleModeSelect("import")}
          style={{
            width: "200px",
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Import Wallet
        </button>
      </div>
    </div>
  );

  const renderChooseLengthStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Select Seed Phrase Length</h3>
      <div style={{ display: "flex", gap: 30, margin: "24px 0", justifyContent: "center" }}>
        {SEED_WORD_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSeedLengthSelect(opt)}
            style={{
              width: "120px",
              padding: "12px",
              backgroundColor: "#3070ea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
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
        gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
        gap: "12px",
        margin: "18px 0"
      }}>
        {seedPhrase.map((word, idx) => (
          <div key={idx} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #dee2e6",
            minHeight: "48px"
          }}>
            <span style={{ fontSize: 12, color: "#6c757d", minWidth: "20px" }}>
              {idx + 1}.
            </span>
            <span style={{ fontSize: 14, fontWeight: "bold" }}>{word}</span>
          </div>
        ))}
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
          />
          <span style={{ fontSize: "14px" }}>
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
        gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
        gap: "12px",
        margin: "18px 0"
      }}>
        {seedPhrase.map((word, idx) => {
          const isMissing = verifyIndexes.includes(idx);
          const verifyIndex = verifyIndexes.indexOf(idx);

          return (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
              minHeight: "48px"
            }}>
              <span style={{ fontSize: 12, color: "#6c757d", minWidth: "20px" }}>
                {idx + 1}.
              </span>
              {isMissing ? (
                <input
                  style={{
                    flex: 1,
                    padding: "4px",
                    fontSize: 14,
                    fontWeight: "bold",
                    backgroundColor: "white",
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                    outline: "none"
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
                <span style={{ fontSize: 14, fontWeight: "bold" }}>{word}</span>
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
        <span style={{ fontSize: "14px" }}>
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
      <h3>Security Configuration</h3>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "16px", fontWeight: "bold", display: "block", marginBottom: "10px" }}>
          Security Level:
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { value: "basic", label: "Basic", desc: "Standard encryption" },
            { value: "enhanced", label: "Enhanced", desc: "Device binding + stronger encryption" },
            { value: "maximum", label: "Maximum", desc: "All security features enabled" }
          ].map(level => (
            <label key={level.value} style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: securityLevel === level.value ? "2px solid #3070ea" : "1px solid #ced4da",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: securityLevel === level.value ? "#e3f2fd" : "white",
              flex: "1",
              minWidth: "150px"
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
                <div style={{ fontWeight: "bold" }}>{level.label}</div>
                <div style={{ fontSize: "12px", color: "#6c757d" }}>{level.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {securityLevel !== "basic" && (
        <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
          <h4>Additional Security Options:</h4>

          <label style={{ display: "flex", alignItems: "center", margin: "12px 0", gap: "8px" }}>
            <input
              type="checkbox"
              checked={enableTimelock}
              onChange={(e) => setEnableTimelock(e.target.checked)}
            />
            <span>Enable transaction time delays for large amounts</span>
          </label>

          {enableTimelock && (
            <div style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <label>Delay period: </label>
              <select
                value={timelockHours}
                onChange={(e) => setTimelockHours(Number(e.target.value))}
                style={{ padding: "4px", marginLeft: "8px" }}
              >
                <option value={1}>1 hour</option>
                <option value={24}>24 hours</option>
                <option value={72}>72 hours</option>
              </select>
            </div>
          )}

          <label style={{ display: "flex", alignItems: "center", margin: "12px 0", gap: "8px" }}>
            <input
              type="checkbox"
              checked={enableMultiDevice}
              onChange={(e) => setEnableMultiDevice(e.target.checked)}
            />
            <span>Enable multi-device recovery options</span>
          </label>

          {enableMultiDevice && (
            <div style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <input
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da" }}
                type="email"
                placeholder="Recovery email (optional)"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
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
      <h3>Optional: Create an SNS Handle</h3>
      <input
        style={{ width: "100%", margin: "10px 0", padding: 12, fontSize: 16, borderRadius: "4px", border: "1px solid #ced4da" }}
        type="text"
        placeholder="username.syn (optional)"
        value={sns}
        disabled={snsSkip}
        onChange={(e) => setSNS(e.target.value)}
      />
      <label style={{ display: "block", marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={snsSkip}
          onChange={() => setSNSSkip(!snsSkip)}
          style={{ marginRight: "8px" }}
        />
        Skip this step
      </label>
    </div>
  );

  const renderImportEntryStep = () => (
    <div>
      <h3 style={{ textAlign: "center" }}>Enter Your Seed Phrase</h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        margin: "18px 0",
        maxWidth: "400px",
        margin: "18px auto"
      }}>
        {enteredSeedPhrase.map((word, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: 12, color: "#6c757d", minWidth: "20px" }}>
              {idx + 1}.
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
        ))}
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
      <p>Redirecting to dashboard...</p>
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

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "32px", textAlign: "center", backgroundColor: "#3070ea", color: "white" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>Synergy Wallet</h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
            Your secure gateway to the Synergy Network
          </p>
        </div>

        <div style={{ padding: "32px" }}>
          {step !== Steps.MODE && step !== Steps.COMPLETE && renderProgressBar()}

          <div style={{ minHeight: "400px" }}>
            {renderCurrentStep()}
          </div>

          {error && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
              border: "1px solid #f5c6cb"
            }}>
              {error}
            </div>
          )}

          {step !== Steps.MODE && step !== Steps.COMPLETE && (
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              marginTop: "24px"
            }}>
              <button
                onClick={() => setStep(getBackStep())}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  minWidth: "100px"
                }}
              >
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed() || processing}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: canProceed() && !processing ? "#3070ea" : "#ced4da",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: canProceed() && !processing ? "pointer" : "not-allowed",
                  minWidth: "140px"
                }}
              >
                {getNextButtonText()}
              </button>
            </div>
          )}
        </div>
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
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#dc3545" }}>
              ⚠️ Critical Security Information
            </h3>
            <div style={{ lineHeight: "1.6", marginBottom: "24px" }}>
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
                onClick={() => {
                  setShowDisclaimerModal(false);
                  setSeedPhraseConfirmed(true);
                }}
                style={{
                  padding: "12px 32px",
                  fontSize: "16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                I Understand the Risks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
