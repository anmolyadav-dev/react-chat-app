import CryptoJS from 'crypto-js';

class Encryption {
  constructor() {
    this.algorithm = 'AES';
  }

  // Generate a key pair for E2E encryption (simplified for demo)
  generateKeyPair() {
    const privateKey = CryptoJS.lib.WordArray.random(256/8).toString();
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    return { privateKey, publicKey };
  }

  // Encrypt message with recipient's public key
  encryptMessage(message, publicKey) {
    try {
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
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, privateKey);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Generate a shared secret for two users
  generateSharedSecret(privateKey1, privateKey2) {
    const combined = privateKey1 + privateKey2;
    return CryptoJS.SHA256(combined).toString();
  }
}

export default new Encryption();
