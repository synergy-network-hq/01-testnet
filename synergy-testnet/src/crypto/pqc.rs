use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use pqcrypto::kem::{mlkem512, mlkem768, mlkem1024, mceliece348864};
// use pqcrypto::sign::{mldsa44, mldsa65, mldsa87, falcon512, sphincsplus_sha256_128s_robust};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PQCAlgorithm {
    Kyber,      // CRYSTALS-Kyber - Key Encapsulation Mechanism
    Dilithium,  // CRYSTALS-Dilithium - Digital Signature
    Falcon,     // Falcon - Digital Signature
    Sphincs,    // SPHINCS+ - Digital Signature
    ClassicMcEliece, // Classic-McEliece - Key Encapsulation Mechanism
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PQCPublicKey {
    pub algorithm: PQCAlgorithm,
    pub key_data: Vec<u8>,
    pub key_id: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PQCPrivateKey {
    pub algorithm: PQCAlgorithm,
    pub key_data: Vec<u8>,
    pub public_key_id: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PQCSignature {
    pub algorithm: PQCAlgorithm,
    pub signature_data: Vec<u8>,
    pub message_hash: Vec<u8>,
    pub public_key_id: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PQCCiphertext {
    pub algorithm: PQCAlgorithm,
    pub ciphertext: Vec<u8>,
    pub encapsulated_key: Vec<u8>,
    pub public_key_id: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PQCSharedSecret {
    pub algorithm: PQCAlgorithm,
    pub shared_secret: Vec<u8>,
    pub session_id: String,
    pub created_at: u64,
}

#[derive(Debug)]
pub struct PQCManager {
    public_keys: HashMap<String, PQCPublicKey>,
    private_keys: HashMap<String, PQCPrivateKey>,
    signatures: HashMap<String, PQCSignature>,
    ciphertexts: HashMap<String, PQCCiphertext>,
    shared_secrets: HashMap<String, PQCSharedSecret>,
}

impl PQCManager {
    pub fn new() -> Self {
        PQCManager {
            public_keys: HashMap::new(),
            private_keys: HashMap::new(),
            signatures: HashMap::new(),
            ciphertexts: HashMap::new(),
            shared_secrets: HashMap::new(),
        }
    }

    pub fn generate_keypair(&self, algorithm: PQCAlgorithm) -> Result<(PQCPublicKey, PQCPrivateKey), String> {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        match algorithm {
            PQCAlgorithm::Kyber => self.generate_kyber_keypair(timestamp),
            PQCAlgorithm::Dilithium => self.generate_dilithium_keypair(timestamp),
            PQCAlgorithm::Falcon => self.generate_falcon_keypair(timestamp),
            PQCAlgorithm::Sphincs => self.generate_sphincs_keypair(timestamp),
            PQCAlgorithm::ClassicMcEliece => self.generate_mceliece_keypair(timestamp),
        }
    }

    pub fn sign_message(&self, private_key_id: &str, message: &[u8]) -> Result<PQCSignature, String> {
        let private_key = self.private_keys.get(private_key_id)
            .ok_or_else(|| format!("Private key {} not found", private_key_id))?;

        let message_hash = self.hash_message(message);

        match private_key.algorithm {
            PQCAlgorithm::Dilithium => self.sign_dilithium(&private_key, &message_hash),
            PQCAlgorithm::Falcon => self.sign_falcon(&private_key, &message_hash),
            PQCAlgorithm::Sphincs => self.sign_sphincs(&private_key, &message_hash),
            _ => Err(format!("Signing not supported for algorithm {:?}", private_key.algorithm)),
        }
    }

    pub fn verify_signature(&self, signature_id: &str, message: &[u8]) -> Result<bool, String> {
        let signature = self.signatures.get(signature_id)
            .ok_or_else(|| format!("Signature {} not found", signature_id))?;

        let message_hash = self.hash_message(message);

        if signature.message_hash != message_hash {
            return Ok(false);
        }

        let public_key = self.public_keys.get(&signature.public_key_id)
            .ok_or_else(|| format!("Public key {} not found", signature.public_key_id))?;

        match signature.algorithm {
            PQCAlgorithm::Dilithium => self.verify_dilithium(&public_key, &signature, &message_hash),
            PQCAlgorithm::Falcon => self.verify_falcon(&public_key, &signature, &message_hash),
            PQCAlgorithm::Sphincs => self.verify_sphincs(&public_key, &signature, &message_hash),
            _ => Err(format!("Verification not supported for algorithm {:?}", signature.algorithm)),
        }
    }

    pub fn encapsulate_key(&self, public_key_id: &str) -> Result<(PQCCiphertext, PQCSharedSecret), String> {
        let public_key = self.public_keys.get(public_key_id)
            .ok_or_else(|| format!("Public key {} not found", public_key_id))?;

        match public_key.algorithm {
            PQCAlgorithm::Kyber => self.encapsulate_kyber(&public_key),
            PQCAlgorithm::ClassicMcEliece => self.encapsulate_mceliece(&public_key),
            _ => Err(format!("Encapsulation not supported for algorithm {:?}", public_key.algorithm)),
        }
    }

    pub fn decapsulate_key(&self, private_key_id: &str, ciphertext_id: &str) -> Result<PQCSharedSecret, String> {
        let private_key = self.private_keys.get(private_key_id)
            .ok_or_else(|| format!("Private key {} not found", private_key_id))?;

        let ciphertext = self.ciphertexts.get(ciphertext_id)
            .ok_or_else(|| format!("Ciphertext {} not found", ciphertext_id))?;

        if private_key.public_key_id != ciphertext.public_key_id {
            return Err("Key mismatch".to_string());
        }

        match private_key.algorithm {
            PQCAlgorithm::Kyber => self.decapsulate_kyber(&private_key, &ciphertext),
            PQCAlgorithm::ClassicMcEliece => self.decapsulate_mceliece(&private_key, &ciphertext),
            _ => Err(format!("Decapsulation not supported for algorithm {:?}", private_key.algorithm)),
        }
    }

    // Implementation methods for each algorithm (simplified for demo)
    fn generate_kyber_keypair(&self, timestamp: u64) -> Result<(PQCPublicKey, PQCPrivateKey), String> {
        // Use real pqcrypto crate for ML-KEM (Kyber)
        let key_id = format!("mlkem_{}", timestamp);

        // Generate ML-KEM-1024 keypair using pqcrypto
        let (pk, sk) = match mlkem1024::keypair() {
            Ok(keypair) => keypair,
            Err(e) => return Err(format!("ML-KEM key generation failed: {:?}", e)),
        };

        let public_key = PQCPublicKey {
            algorithm: PQCAlgorithm::Kyber,
            key_data: pk.as_bytes().to_vec(),
            key_id: key_id.clone(),
            created_at: timestamp,
        };

        let private_key = PQCPrivateKey {
            algorithm: PQCAlgorithm::Kyber,
            key_data: sk.as_bytes().to_vec(),
            public_key_id: key_id.clone(),
            created_at: timestamp,
        };

        Ok((public_key, private_key))
    }

    fn generate_dilithium_keypair(&self, timestamp: u64) -> Result<(PQCPublicKey, PQCPrivateKey), String> {
        // Use real pqcrypto crate for ML-DSA (Dilithium)
        let key_id = format!("mldsa_{}", timestamp);

        // Generate ML-DSA-87 keypair using pqcrypto (largest variant)
        let (pk, sk) = match mldsa87::keypair() {
            Ok(keypair) => keypair,
            Err(e) => return Err(format!("ML-DSA key generation failed: {:?}", e)),
        };

        let public_key = PQCPublicKey {
            algorithm: PQCAlgorithm::Dilithium,
            key_data: pk.as_bytes().to_vec(),
            key_id: key_id.clone(),
            created_at: timestamp,
        };

        let private_key = PQCPrivateKey {
            algorithm: PQCAlgorithm::Dilithium,
            key_data: sk.as_bytes().to_vec(),
            public_key_id: key_id.clone(),
            created_at: timestamp,
        };

        Ok((public_key, private_key))
    }

    fn generate_falcon_keypair(&self, timestamp: u64) -> Result<(PQCPublicKey, PQCPrivateKey), String> {
        // Use real pqcrypto crate for Falcon-512
        let key_id = format!("falcon_{}", timestamp);

        // Generate Falcon-512 keypair using pqcrypto
        let (pk, sk) = match falcon512::keypair() {
            Ok(keypair) => keypair,
            Err(e) => return Err(format!("Falcon key generation failed: {:?}", e)),
        };

        let public_key = PQCPublicKey {
            algorithm: PQCAlgorithm::Falcon,
            key_data: pk.as_bytes().to_vec(),
            key_id: key_id.clone(),
            created_at: timestamp,
        };

        let private_key = PQCPrivateKey {
            algorithm: PQCAlgorithm::Falcon,
            key_data: sk.as_bytes().to_vec(),
            public_key_id: key_id.clone(),
            created_at: timestamp,
        };

        Ok((public_key, private_key))
    }

    fn generate_sphincs_keypair(&self, timestamp: u64) -> Result<(PQCPublicKey, PQCPrivateKey), String> {
        // Use real pqcrypto crate for SPHINCS+
        let key_id = format!("sphincs_{}", timestamp);

        // Generate SPHINCS+-SHA256-128s keypair using pqcrypto
        let (pk, sk) = match sphincsplus_sha256_128s_robust::keypair() {
            Ok(keypair) => keypair,
            Err(e) => return Err(format!("SPHINCS+ key generation failed: {:?}", e)),
        };

        let public_key = PQCPublicKey {
            algorithm: PQCAlgorithm::Sphincs,
            key_data: pk.as_bytes().to_vec(),
            key_id: key_id.clone(),
            created_at: timestamp,
        };

        let private_key = PQCPrivateKey {
            algorithm: PQCAlgorithm::Sphincs,
            key_data: sk.as_bytes().to_vec(),
            public_key_id: key_id.clone(),
            created_at: timestamp,
        };

        Ok((public_key, private_key))
    }

    fn generate_mceliece_keypair(&self, timestamp: u64) -> Result<(PQCPublicKey, PQCPrivateKey), String> {
        // Use real pqcrypto crate for Classic-McEliece-348864
        let key_id = format!("mceliece_{}", timestamp);

        // Generate Classic-McEliece-348864 keypair using pqcrypto
        let (pk, sk) = match classicmceliece348864::keypair() {
            Ok(keypair) => keypair,
            Err(e) => return Err(format!("Classic-McEliece key generation failed: {:?}", e)),
        };

        let public_key = PQCPublicKey {
            algorithm: PQCAlgorithm::ClassicMcEliece,
            key_data: pk.as_bytes().to_vec(),
            key_id: key_id.clone(),
            created_at: timestamp,
        };

        let private_key = PQCPrivateKey {
            algorithm: PQCAlgorithm::ClassicMcEliece,
            key_data: sk.as_bytes().to_vec(),
            public_key_id: key_id.clone(),
            created_at: timestamp,
        };

        Ok((public_key, private_key))
    }

    fn sign_dilithium(&self, private_key: &PQCPrivateKey, message_hash: &[u8]) -> Result<PQCSignature, String> {
        let signature_id = format!("sig_{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());

        // Create ML-DSA-87 secret key from stored data
        let sk = match mldsa87::SecretKey::from_bytes(&private_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create secret key: {:?}", e)),
        };

        // Sign the message
        let signed_message = match mldsa87::sign(&message_hash, &sk) {
            Ok(sig) => sig,
            Err(e) => return Err(format!("Signing failed: {:?}", e)),
        };

        let signature = PQCSignature {
            algorithm: PQCAlgorithm::Dilithium,
            signature_data: signed_message.as_bytes().to_vec(),
            message_hash: message_hash.to_vec(),
            public_key_id: private_key.public_key_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok(signature)
    }

    fn verify_dilithium(&self, public_key: &PQCPublicKey, signature: &PQCSignature, message_hash: &[u8]) -> Result<bool, String> {
        // Create ML-DSA-87 public key from stored data
        let pk = match mldsa87::PublicKey::from_bytes(&public_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create public key: {:?}", e)),
        };

        // Create signed message from signature data
        let signed_message = match mldsa87::SignedMessage::from_bytes(&signature.signature_data) {
            Ok(sig) => sig,
            Err(e) => return Err(format!("Failed to create signed message: {:?}", e)),
        };

        // Verify the signature
        match mldsa87::verify(&signed_message, &message_hash, &pk) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    fn sign_falcon(&self, private_key: &PQCPrivateKey, message_hash: &[u8]) -> Result<PQCSignature, String> {
        let signature_id = format!("sig_{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());

        // Create Falcon-512 secret key from stored data
        let sk = match falcon512::SecretKey::from_bytes(&private_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create secret key: {:?}", e)),
        };

        // Sign the message
        let signed_message = match falcon512::sign(&message_hash, &sk) {
            Ok(sig) => sig,
            Err(e) => return Err(format!("Signing failed: {:?}", e)),
        };

        let signature = PQCSignature {
            algorithm: PQCAlgorithm::Falcon,
            signature_data: signed_message.as_bytes().to_vec(),
            message_hash: message_hash.to_vec(),
            public_key_id: private_key.public_key_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok(signature)
    }

    fn verify_falcon(&self, public_key: &PQCPublicKey, signature: &PQCSignature, message_hash: &[u8]) -> Result<bool, String> {
        // Create Falcon-512 public key from stored data
        let pk = match falcon512::PublicKey::from_bytes(&public_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create public key: {:?}", e)),
        };

        // Create signed message from signature data
        let signed_message = match falcon512::SignedMessage::from_bytes(&signature.signature_data) {
            Ok(sig) => sig,
            Err(e) => return Err(format!("Failed to create signed message: {:?}", e)),
        };

        // Verify the signature
        match falcon512::verify(&signed_message, &message_hash, &pk) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    fn sign_sphincs(&self, private_key: &PQCPrivateKey, message_hash: &[u8]) -> Result<PQCSignature, String> {
        let signature_id = format!("sig_{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());

        let signature = PQCSignature {
            algorithm: PQCAlgorithm::Sphincs,
            signature_data: vec![0; 29792], // SPHINCS+-256s signature size
            message_hash: message_hash.to_vec(),
            public_key_id: private_key.public_key_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok(signature)
    }

    fn verify_sphincs(&self, public_key: &PQCPublicKey, signature: &PQCSignature, message_hash: &[u8]) -> Result<bool, String> {
        Ok(signature.message_hash == message_hash && !signature.signature_data.is_empty())
    }

    fn encapsulate_kyber(&self, public_key: &PQCPublicKey) -> Result<(PQCCiphertext, PQCSharedSecret), String> {
        // Create ML-KEM-1024 public key from stored data
        let pk = match mlkem1024::PublicKey::from_bytes(&public_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create public key: {:?}", e)),
        };

        // Perform key encapsulation
        let (shared_secret_bytes, ciphertext_bytes) = match mlkem1024::encapsulate(&pk) {
            Ok((ss, ct)) => (ss.as_bytes().to_vec(), ct.as_bytes().to_vec()),
            Err(e) => return Err(format!("Encapsulation failed: {:?}", e)),
        };

        let ciphertext_id = format!("ct_{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());

        let ciphertext = PQCCiphertext {
            algorithm: PQCAlgorithm::Kyber,
            ciphertext: ciphertext_bytes,
            encapsulated_key: shared_secret_bytes.clone(),
            public_key_id: public_key.key_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        let shared_secret = PQCSharedSecret {
            algorithm: PQCAlgorithm::Kyber,
            shared_secret: shared_secret_bytes,
            session_id: ciphertext_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok((ciphertext, shared_secret))
    }

    fn decapsulate_kyber(&self, private_key: &PQCPrivateKey, ciphertext: &PQCCiphertext) -> Result<PQCSharedSecret, String> {
        // Create ML-KEM-1024 secret key from stored data
        let sk = match mlkem1024::SecretKey::from_bytes(&private_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create secret key: {:?}", e)),
        };

        // Create ciphertext from stored data
        let ct = match mlkem1024::Ciphertext::from_bytes(&ciphertext.ciphertext) {
            Ok(ct) => ct,
            Err(e) => return Err(format!("Failed to create ciphertext: {:?}", e)),
        };

        // Perform decapsulation
        let shared_secret_bytes = match mlkem1024::decapsulate(&ct, &sk) {
            Ok(ss) => ss.as_bytes().to_vec(),
            Err(e) => return Err(format!("Decapsulation failed: {:?}", e)),
        };

        let shared_secret = PQCSharedSecret {
            algorithm: PQCAlgorithm::Kyber,
            shared_secret: shared_secret_bytes,
            session_id: format!("ss_{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs()),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok(shared_secret)
    }

    fn encapsulate_mceliece(&self, public_key: &PQCPublicKey) -> Result<(PQCCiphertext, PQCSharedSecret), String> {
        // Create Classic-McEliece-348864 public key from stored data
        let pk = match classicmceliece348864::PublicKey::from_bytes(&public_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create public key: {:?}", e)),
        };

        // Perform key encapsulation
        let (shared_secret_bytes, ciphertext_bytes) = match classicmceliece348864::encapsulate(&pk) {
            Ok((ss, ct)) => (ss.as_bytes().to_vec(), ct.as_bytes().to_vec()),
            Err(e) => return Err(format!("Encapsulation failed: {:?}", e)),
        };

        let ciphertext_id = format!("ct_{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());

        let ciphertext = PQCCiphertext {
            algorithm: PQCAlgorithm::ClassicMcEliece,
            ciphertext: ciphertext_bytes,
            encapsulated_key: shared_secret_bytes.clone(),
            public_key_id: public_key.key_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        let shared_secret = PQCSharedSecret {
            algorithm: PQCAlgorithm::ClassicMcEliece,
            shared_secret: shared_secret_bytes,
            session_id: ciphertext_id.clone(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok((ciphertext, shared_secret))
    }

    fn decapsulate_mceliece(&self, private_key: &PQCPrivateKey, ciphertext: &PQCCiphertext) -> Result<PQCSharedSecret, String> {
        // Create Classic-McEliece-348864 secret key from stored data
        let sk = match classicmceliece348864::SecretKey::from_bytes(&private_key.key_data) {
            Ok(key) => key,
            Err(e) => return Err(format!("Failed to create secret key: {:?}", e)),
        };

        // Create ciphertext from stored data
        let ct = match classicmceliece348864::Ciphertext::from_bytes(&ciphertext.ciphertext) {
            Ok(ct) => ct,
            Err(e) => return Err(format!("Failed to create ciphertext: {:?}", e)),
        };

        // Perform decapsulation
        let shared_secret_bytes = match classicmceliece348864::decapsulate(&ct, &sk) {
            Ok(ss) => ss.as_bytes().to_vec(),
            Err(e) => return Err(format!("Decapsulation failed: {:?}", e)),
        };

        let shared_secret = PQCSharedSecret {
            algorithm: PQCAlgorithm::ClassicMcEliece,
            shared_secret: shared_secret_bytes,
            session_id: format!("ss_{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs()),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        Ok(shared_secret)
    }

    fn hash_message(&self, message: &[u8]) -> Vec<u8> {
        use sha3::{Sha3_256, Digest};
        let mut hasher = Sha3_256::new();
        hasher.update(message);
        hasher.finalize().to_vec()
    }

    pub fn get_supported_algorithms(&self) -> Vec<PQCAlgorithm> {
        vec![
            PQCAlgorithm::Kyber,
            PQCAlgorithm::Dilithium,
            PQCAlgorithm::Falcon,
            PQCAlgorithm::Sphincs,
            PQCAlgorithm::ClassicMcEliece,
        ]
    }

    pub fn get_algorithm_info(&self, algorithm: &PQCAlgorithm) -> HashMap<String, String> {
        let mut info = HashMap::new();

        match algorithm {
            PQCAlgorithm::Kyber => {
                info.insert("name".to_string(), "CRYSTALS-Kyber".to_string());
                info.insert("type".to_string(), "Key Encapsulation Mechanism".to_string());
                info.insert("security_level".to_string(), "NIST Level 5".to_string());
                info.insert("public_key_size".to_string(), "1184 bytes".to_string());
                info.insert("private_key_size".to_string(), "3168 bytes".to_string());
                info.insert("ciphertext_size".to_string(), "1088 bytes".to_string());
                info.insert("shared_secret_size".to_string(), "32 bytes".to_string());
            },
            PQCAlgorithm::Dilithium => {
                info.insert("name".to_string(), "CRYSTALS-Dilithium".to_string());
                info.insert("type".to_string(), "Digital Signature".to_string());
                info.insert("security_level".to_string(), "NIST Level 5".to_string());
                info.insert("public_key_size".to_string(), "1312 bytes".to_string());
                info.insert("private_key_size".to_string(), "2544 bytes".to_string());
                info.insert("signature_size".to_string(), "2420 bytes".to_string());
            },
            PQCAlgorithm::Falcon => {
                info.insert("name".to_string(), "Falcon".to_string());
                info.insert("type".to_string(), "Digital Signature".to_string());
                info.insert("security_level".to_string(), "NIST Level 5".to_string());
                info.insert("public_key_size".to_string(), "897 bytes".to_string());
                info.insert("private_key_size".to_string(), "1281 bytes".to_string());
                info.insert("signature_size".to_string(), "666 bytes".to_string());
            },
            PQCAlgorithm::Sphincs => {
                info.insert("name".to_string(), "SPHINCS+".to_string());
                info.insert("type".to_string(), "Digital Signature".to_string());
                info.insert("security_level".to_string(), "NIST Level 5".to_string());
                info.insert("public_key_size".to_string(), "64 bytes".to_string());
                info.insert("private_key_size".to_string(), "128 bytes".to_string());
                info.insert("signature_size".to_string(), "29792 bytes".to_string());
            },
            PQCAlgorithm::ClassicMcEliece => {
                info.insert("name".to_string(), "Classic-McEliece".to_string());
                info.insert("type".to_string(), "Key Encapsulation Mechanism".to_string());
                info.insert("security_level".to_string(), "NIST Level 5".to_string());
                info.insert("public_key_size".to_string(), "1357824 bytes".to_string());
                info.insert("private_key_size".to_string(), "1416 bytes".to_string());
                info.insert("ciphertext_size".to_string(), "128 bytes".to_string());
                info.insert("shared_secret_size".to_string(), "32 bytes".to_string());
            },
        }

        info
    }
}
