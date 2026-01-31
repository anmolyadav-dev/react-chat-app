import CryptoJS from 'crypto-js';

class Encryption {
  constructor() {
    this.algorithm = 'AES';
  }

  // Generate a key pair for symmetric encryption
  generateKeyPair() {
    // Generate a random key for symmetric encryption
    const key = CryptoJS.lib.WordArray.random(256/8).toString();
    return {
      publicKey: key, // In this implementation, we use symmetric encryption
      privateKey: key  // Same key for both encryption and decryption
    };
  }

  // Encrypt message with recipient's public key
  encryptMessage(message, publicKey) {
    try {
      if (!message || !publicKey) {
        console.error('Missing message or public key for encryption');
        return null;
      }
      
      // Use AES encryption with the public key
      const encrypted = CryptoJS.AES.encrypt(message, publicKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  // Decrypt message with private key
  decryptMessage(encryptedMessage, privateKey) {
    try {
      if (!encryptedMessage || !privateKey) {
        console.error('Missing encrypted message or private key for decryption');
        return null;
      }
      
      // Use AES decryption with the private key
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, privateKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        console.error('Decryption returned empty string');
        return null;
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Test encryption/decryption
  testEncryption() {
    const { publicKey, privateKey } = this.generateKeyPair();
    const testMessage = "Hello, World!";
    
    const encrypted = this.encryptMessage(testMessage, publicKey);
    const decrypted = this.decryptMessage(encrypted, privateKey);
    
    return {
      original: testMessage,
      encrypted,
      decrypted,
      success: decrypted === testMessage
    };
  }

  // Generate a shared secret for two users
  generateSharedSecret(privateKey1, privateKey2) {
    if (!privateKey1 || !privateKey2) {
      console.error("Missing private keys for shared secret generation");
      return null;
    }
    
    console.log("Generating shared secret with keys:", {
      key1Length: privateKey1.length,
      key2Length: privateKey2.length,
      key1Prefix: privateKey1.substring(0, 10) + "...",
      key2Prefix: privateKey2.substring(0, 10) + "..."
    });
    
    // Sort keys to ensure consistent shared secret regardless of order
    const sortedKeys = [privateKey1, privateKey2].sort();
    const combined = sortedKeys[0] + sortedKeys[1];
    const sharedSecret = CryptoJS.SHA256(combined).toString();
    
    console.log("Shared secret generated:", sharedSecret.substring(0, 20) + "...");
    return sharedSecret;
  }
}

const encryption = new Encryption();
export default encryption;
