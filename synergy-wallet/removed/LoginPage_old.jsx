import React, { useState } from "react";
import * as bip39 from "bip39";
import { generateDeterministicDilithiumKeypair } from "../utils/pqc";
import {
  generateBTCAddressFromMnemonic,
  generateETHWalletFromMnemonic,
  generateSOLWalletFromMnemonic,
} from "../utils/umaAddresses";
import { pubkeyToSynergyAddress } from "../utils/synergyAddress";
import { encryptSecret } from "../utils/crypto";
import { toHex } from "../utils/hexUtils";
import { useNavigate } from "react-router-dom";

const SEED_WORD_OPTIONS = [12, 24];
const DEFAULT_VERIFY_WORDS = 3;

const Steps = {
  MODE: 0,
  CREATE_CHOOSE_LENGTH: 1,
  CREATE_REVEAL: 2,
  CREATE_VERIFY: 3,
  IMPORT_CHOOSE_LENGTH: 4,
  IMPORT_ENTRY: 5,
  PASSWORD: 6,
  SNS: 7,
  COMPLETE: 8,
};

export default function LoginPage({ onWalletCreated }) {
  const [step, setStep] = useState(Steps.MODE);
  const [mode, setMode] = useState("create");
  const [seedLength, setSeedLength] = useState(12);
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [enteredSeedPhrase, setEnteredSeedPhrase] = useState(
    Array(12).fill("")
  );
  const [verifyIndexes, setVerifyIndexes] = useState([]);
  const [verifyInputs, setVerifyInputs] = useState([]);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [sns, setSNS] = useState("");
  const [snsSkip, setSNSSkip] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [seedPhraseConfirmed, setSeedPhraseConfirmed] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const navigate = useNavigate();

  const totalSteps =
    mode === "create"
      ? [
        Steps.MODE,
        Steps.CREATE_CHOOSE_LENGTH,
        Steps.CREATE_REVEAL,
        Steps.CREATE_VERIFY,
        Steps.PASSWORD,
        Steps.SNS,
        Steps.COMPLETE,
      ]
      : [
        Steps.MODE,
        Steps.IMPORT_CHOOSE_LENGTH,
        Steps.IMPORT_ENTRY,
        Steps.PASSWORD,
        Steps.SNS,
        Steps.COMPLETE,
      ];

  // Create progress steps array without MODE step for progress bar calculation
  const progressSteps = totalSteps.filter(step => step !== Steps.MODE);
  const progress = progressSteps.indexOf(step) / (progressSteps.length - 1);

  function randomUniqueIndexes(n, max) {
    const set = new Set();
    while (set.size < n) set.add(Math.floor(Math.random() * max));
    return Array.from(set).sort((a, b) => a - b);
  }

  function handleModeSelect(m) {
    setMode(m);
    setStep(
      m === "create" ? Steps.CREATE_CHOOSE_LENGTH : Steps.IMPORT_CHOOSE_LENGTH
    );
    setError("");
  }

  function handleSeedLengthSelect(len) {
    setSeedLength(len);
    setSeedPhrase([]);
    setEnteredSeedPhrase(Array(len).fill(""));
    setError("");
    if (mode === "create") setStep(Steps.CREATE_REVEAL);
    else setStep(Steps.IMPORT_ENTRY);
  }

  function handleGenerateSeed() {
    const entropyBits = seedLength === 12 ? 128 : 256;
    const phrase = bip39.generateMnemonic(entropyBits);
    setSeedPhrase(phrase.split(" "));
    setStep(Steps.CREATE_REVEAL);
    setError("");
  }

  function handleRevealContinue() {
    const verifyWordsCount = seedLength === 12 ? 3 : 6;
    setVerifyIndexes(randomUniqueIndexes(verifyWordsCount, seedLength));
    setVerifyInputs(Array(verifyWordsCount).fill(""));
    setStep(Steps.CREATE_VERIFY);
    setError("");
  }

  function handleVerifyContinue() {
    let correct = true;
    verifyIndexes.forEach((idx, i) => {
      if (
        (mode === "create" &&
          verifyInputs[i].trim().toLowerCase() !== seedPhrase[idx]) ||
        (mode === "import" &&
          verifyInputs[i].trim().toLowerCase() !==
          enteredSeedPhrase[idx].trim().toLowerCase())
      ) {
        correct = false;
      }
    });
    if (!correct) {
      setError("One or more words do not match. Please try again.");
      return;
    }
    setError("");
    setStep(Steps.PASSWORD);
  }

  function handleValidateImport() {
    const phrase = enteredSeedPhrase.join(" ").toLowerCase();
    if (!bip39.validateMnemonic(phrase)) {
      setError("Invalid BIP39 seed phrase.");
      return;
    }
    setSeedPhrase(enteredSeedPhrase.map((w) => w.trim().toLowerCase()));
    setError("");
    setStep(Steps.PASSWORD);
  }

  function handlePasswordContinue() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(Steps.SNS);
  }

  async function handleSNSContinue() {
    setError("");
    setProcessing(true);
    try {
      const seedBytes = bip39.mnemonicToSeedSync(seedPhrase.join(" ")); // 64-byte seed
      const { publicKey, privateKey } =
        await generateDeterministicDilithiumKeypair(new Uint8Array(seedBytes));
      const synergyAddress = await pubkeyToSynergyAddress(publicKey);
      const btc = generateBTCAddressFromMnemonic(seedPhrase.join(" "));
      const eth = generateETHWalletFromMnemonic(seedPhrase.join(" "));
      const sol = generateSOLWalletFromMnemonic(seedPhrase.join(" "));
      const mnemonicEnc = await encryptSecret(password, seedPhrase.join(" "));
      const pqcPrivateKeyEnc = await encryptSecret(password, toHex(privateKey));
      const pqcPublicKeyHex = toHex(publicKey);
      const walletObj = {
        id: "wlt_" + Date.now(),
        label: sns && !snsSkip ? `${sns}.syn` : "Synergy Wallet",
        synergyAddress,
        pqcPublicKey: pqcPublicKeyHex,
        pqcPrivateKeyEnc,
        mnemonicEnc,
        bitcoinAddress: btc.address,
        ethereumAddress: eth.address,
        solanaAddress: sol.address,
        networks: ["synergy", "bitcoin", "ethereum", "solana"],
        createdAt: new Date().toISOString(),
        backupStatus: "not_backed_up",
        sns: sns && !snsSkip ? sns : null,
      };
      if (onWalletCreated) onWalletCreated(walletObj);
      setStep(Steps.COMPLETE);
    } catch (err) {
      setError("Wallet creation failed: " + (err.message || err));
    }
    setProcessing(false);
  }

  function handleComplete() {
    setError("");
    // Wallet creation is complete, the parent component will handle navigation
  }

  function renderProgressBar() {
    return (
      <div style={{ width: "100%", margin: "0 0 16px 0" }}>
        <div
          style={{
            height: 8,
            background: "#eee",
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: "#3070ea",
              height: "100%",
              transition: "width 0.4s",
            }}
          />
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 12,
            color: "#999",
            marginTop: 2,
          }}
        >
          Step {progressSteps.indexOf(step) + 1} of {progressSteps.length}
        </div>
      </div>
    );
  }

  function renderStepButtons() {
    if (step === Steps.MODE) return null;

    let backButton = null;
    let nextButton = null;

    switch (step) {
      case Steps.CREATE_CHOOSE_LENGTH:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => setStep(Steps.MODE)}
            style={{ width: "180px", margin: "0 0 22px 0" }}
          >
            &lt; Start Over
          </button>
        );
        break;
      case Steps.CREATE_REVEAL:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => setStep(Steps.CREATE_CHOOSE_LENGTH)}
            style={{ width: "120px", margin: "10px 0" }}
          >
            &lt; Back
          </button>
        );
        nextButton = (
          <button
            className="sidebar-button"
            onClick={handleRevealContinue}
            disabled={!seedPhraseConfirmed}
            style={{ width: "120px", margin: "10px 0" }}
          >
            Next &gt;
          </button>
        );
        break;
      case Steps.CREATE_VERIFY:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => setStep(Steps.CREATE_REVEAL)}
            style={{ width: "120px", margin: "10px 0" }}
          >
            &lt; Back
          </button>
        );
        nextButton = (
          <button
            className="sidebar-button"
            onClick={handleVerifyContinue}
            style={{ width: "120px", margin: "10px 0" }}
          >
            Next &gt;
          </button>
        );
        break;
      case Steps.IMPORT_CHOOSE_LENGTH:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => setStep(Steps.MODE)}
            style={{ width: "180px", margin: "0 0 22px 0" }}
          >
            &lt; Start Over
          </button>
        );
        break;
      case Steps.IMPORT_ENTRY:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => setStep(Steps.IMPORT_CHOOSE_LENGTH)}
            style={{ width: "120px", margin: "10px 0" }}
          >
            &lt; Back
          </button>
        );
        nextButton = (
          <button
            className="sidebar-button"
            onClick={handleValidateImport}
            style={{ width: "120px", margin: "10px 0" }}
          >
            Next &gt;
          </button>
        );
        break;
      case Steps.PASSWORD:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => {
              if (mode === "create") setStep(Steps.CREATE_VERIFY);
              else setStep(Steps.IMPORT_ENTRY);
            }}
            style={{ width: "120px", margin: "10px 0" }}
          >
            &lt; Back
          </button>
        );
        nextButton = (
          <button
            className="sidebar-button"
            onClick={handlePasswordContinue}
            style={{ width: "120px", margin: "10px 0" }}
          >
            Next &gt;
          </button>
        );
        break;
      case Steps.SNS:
        backButton = (
          <button
            className="sidebar-button"
            onClick={() => setStep(Steps.PASSWORD)}
            style={{ width: "120px", margin: "10px 0" }}
          >
            &lt; Back
          </button>
        );
        nextButton = (
          <button
            className="sidebar-button"
            onClick={handleSNSContinue}
            disabled={processing}
            style={{ width: "120px", margin: "10px 0" }}
          >
            Finish
          </button>
        );
        break;
    }

    if (!backButton && !nextButton) return null;

    return (
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: 20 }}>
        {backButton}
        {nextButton}
      </div>
    );
  }

  function renderModeStep() {
    return (
      <div>
        <hr style={{ border: "none", borderTop: "1px solid var(--divider)", margin: "20px 0" }} />
        <h2 style={{ textAlign: "center" }}>Get Started</h2>
        <p style={{ textAlign: "center" }}>Create a new wallet or import an existing one to begin using Synergy Wallet.</p>
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
  }

  function renderChooseLengthStep() {
    return (
      <div>
        <h3 style={{ textAlign: "center" }}>Select Seed Phrase Length</h3>
        <div style={{ display: "flex", gap: 30, margin: "24px 0", justifyContent: "center" }}>
          {SEED_WORD_OPTIONS.map((opt) => (
            <button
              key={opt}
              className="sidebar-button"
              onClick={() => {
                setSeedLength(opt);
                handleGenerateSeed();
              }}
              style={{ width: "180px", margin: "10px 0" }}
            >
              {opt} words
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderRevealStep() {
    return (
      <div>
        <h3 style={{ textAlign: "center" }}>Your Recovery Phrase</h3>
        <p style={{ textAlign: "center" }}>Write down these {seedLength} words in order and keep them safe!</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
            gap: "12px",
            margin: "18px 0"
          }}
        >
          {seedPhrase.map((word, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "var(--code-bg)",
                borderRadius: "4px",
                border: "1px solid var(--divider)",
                minHeight: "48px"
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: "20px" }}>
                {idx + 1}.
              </span>
              <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)" }}>{word}</span>
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
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: "14px", color: "var(--text)" }}>
              I have written down my seed phrase and will store it securely.
            </span>
          </label>
        </div>
      </div>
    );
  }

  function renderImportChooseLengthStep() {
    return (
      <div>
        <h3 style={{ textAlign: "center" }}>Select Seed Phrase Length</h3>
        <div style={{ display: "flex", gap: 30, margin: "24px 0", justifyContent: "center" }}>
          {SEED_WORD_OPTIONS.map((opt) => (
            <button
              key={opt}
              className="sidebar-button"
              onClick={() => handleSeedLengthSelect(opt)}
              style={{ width: "180px", margin: "10px 0" }}
            >
              {opt} words
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderImportEntryStep() {
    return (
      <div>
        <h3 style={{ textAlign: "center" }}>Enter Your Seed Phrase Below</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            margin: "18px 0",
            maxWidth: "400px",
            margin: "18px auto"
          }}
        >
          {enteredSeedPhrase.map((word, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: "20px" }}>
                {idx + 1}.
              </span>
              <input
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: 14,
                  background: "var(--code-bg)",
                  color: "var(--text)",
                  border: "1px solid var(--divider)",
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
        {error && <div style={{ color: "#ff477b", marginTop: 10, textAlign: "center" }}>{error}</div>}
      </div>
    );
  }

  function renderVerifyStep() {
    // Only show verify step for create mode
    if (mode !== "create") {
      return null;
    }

    return (
      <div>
        <h3 style={{ textAlign: "center" }}>Verify Your Seed Phrase</h3>
        <p style={{ textAlign: "center" }}>Fill in the missing words to verify you've written them down correctly:</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: seedLength === 12 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
            gap: "12px",
            margin: "18px 0"
          }}
        >
          {seedPhrase.map((word, idx) => {
            const isMissing = verifyIndexes.includes(idx);
            const verifyIndex = verifyIndexes.indexOf(idx);

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px",
                  background: "var(--code-bg)",
                  borderRadius: "4px",
                  border: "1px solid var(--divider)",
                  minHeight: "48px"
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: "20px" }}>
                  {idx + 1}.
                </span>
                {isMissing ? (
                  <input
                    style={{
                      flex: 1,
                      padding: 0,
                      fontSize: 14,
                      fontWeight: "bold",
                      background: "transparent",
                      color: "var(--text)",
                      border: "none",
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
                  <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)" }}>{word}</span>
                )}
              </div>
            );
          })}
        </div>
        {error && <div style={{ color: "#ff477b", marginTop: 10, textAlign: "center" }}>{error}</div>}
      </div>
    );
  }

  function renderPasswordStep() {
    return (
      <div>
        <h3>Create a Wallet Password</h3>
        <p>
          Your password encrypts your wallet on this device. Do not forget it!
        </p>
        <input
          style={{ width: "100%", margin: "10px 0", padding: 8, fontSize: 16 }}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          style={{ width: "100%", margin: "10px 0", padding: 8, fontSize: 16 }}
          type="password"
          placeholder="Confirm password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        {error && <div style={{ color: "#ff477b", marginTop: 10, textAlign: "center" }}>{error}</div>}
      </div>
    );
  }

  function renderSNSStep() {
    return (
      <div>
        <h3>Optional: Create an SNS Handle</h3>
        <input
          style={{ width: "100%", margin: "10px 0", padding: 8, fontSize: 16 }}
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
          />
          Skip this step
        </label>
        {error && <div style={{ color: "#ff477b", marginTop: 10, textAlign: "center" }}>{error}</div>}
      </div>
    );
  }

  function renderCompleteStep() {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <h2>Wallet Setup Complete!</h2>
        <p>
          You can view your wallet address and all details from the Settings
          page.
          <br />
          Redirecting to dashboard...
        </p>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            className="sidebar-button"
            onClick={handleComplete}
            style={{ width: "200px", margin: "10px 0" }}
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }

  let stepUI = null;
  switch (step) {
    case Steps.MODE:
      stepUI = renderModeStep();
      break;
    case Steps.CREATE_CHOOSE_LENGTH:
      stepUI = renderChooseLengthStep();
      break;
    case Steps.CREATE_REVEAL:
      stepUI = renderRevealStep();
      break;
    case Steps.IMPORT_CHOOSE_LENGTH:
      stepUI = renderImportChooseLengthStep();
      break;
    case Steps.IMPORT_ENTRY:
      stepUI = renderImportEntryStep();
      break;
    case Steps.CREATE_VERIFY:
      stepUI = renderVerifyStep();
      break;
    case Steps.PASSWORD:
      stepUI = renderPasswordStep();
      break;
    case Steps.SNS:
      stepUI = renderSNSStep();
      break;
    case Steps.COMPLETE:
      stepUI = renderCompleteStep();
      break;
    default:
      stepUI = null;
  }

  return (
    <div className="container" style={{ background: "var(--bg)" }}>
      <div className="content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <section className="section dashboard-card" style={{ maxWidth: "600px", width: "100%" }}>
          <h1 className="h1 inlineStyle84" style={{ textAlign: "center" }}>Synergy Wallet</h1>
          <p style={{ textAlign: "center", fontSize: "18px", marginBottom: "10px", color: "var(--text-muted)" }}>
            Your secure gateway to the Synergy Network
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
            marginBottom: "5px",
            padding: "0 20px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔐</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Secure</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚡</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Fast</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌐</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Multi-Chain</div>
            </div>
          </div>
          <hr style={{ margin: "10px 0", borderColor: "var(--divider)" }} />
          <div style={{ minWidth: 420, maxWidth: 500, padding: 20, margin: "0 auto", minHeight: "400px", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
              {stepUI}
            </div>
            {step !== Steps.MODE && (
              <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                {renderProgressBar()}
                {renderStepButtons()}
              </div>
            )}
            {processing && (
              <div style={{ marginTop: 12, color: "var(--text-muted)", textAlign: "center" }}>
                Creating wallet, please wait...
              </div>
            )}
            {error && <div style={{ color: "#ff477b", marginTop: 10, textAlign: "center" }}>{error}</div>}
          </div>
        </section>
      </div>

      {/* Disclaimer Modal */}
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
            padding: "30px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid var(--divider)"
          }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px", color: "var(--text)" }}>
              ⚠️ Important Security Warning
            </h3>
            <div style={{ color: "var(--text)", lineHeight: "1.6", marginBottom: "20px" }}>
              <p style={{ marginBottom: "15px" }}>
                <strong>Your seed phrase is the master key to your wallet.</strong> Anyone who has access to your seed phrase can access all of your funds.
              </p>
              <p style={{ marginBottom: "15px" }}>
                <strong>Write it down securely:</strong> Store your seed phrase in a safe, offline location. Consider using a fireproof safe or other secure storage.
              </p>
              <p style={{ marginBottom: "15px" }}>
                <strong>Never share your seed phrase:</strong> No legitimate service, support team, or company will ever ask for your seed phrase. If anyone asks for it, they are trying to scam you.
              </p>
              <p style={{ marginBottom: "15px" }}>
                <strong>Be vigilant:</strong> Scammers often impersonate legitimate services. Always verify the authenticity of any communication claiming to be from Synergy Wallet or related services.
              </p>
              <p style={{ color: "#ff477b", fontWeight: "bold" }}>
                If you lose your seed phrase, you will permanently lose access to your wallet and all funds.
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <button
                className="sidebar-button"
                onClick={() => {
                  setShowDisclaimerModal(false);
                  setSeedPhraseConfirmed(true);
                }}
                style={{ width: "190px", margin: "10px 0" }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
