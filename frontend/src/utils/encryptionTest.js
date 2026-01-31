import encryption from './encryption.js';

// Test function to verify encryption/decryption
export const testEncryption = () => {
  console.log("Testing encryption/decryption...");
  
  try {
    // Generate test keys
    const { privateKey, publicKey } = encryption.generateKeyPair();
    console.log("Generated test keys");
    
    // Test message
    const testMessage = "Hello, this is a test message!";
    console.log("Original message:", testMessage);
    
    // Encrypt with public key
    const encrypted = encryption.encryptMessage(testMessage, publicKey);
    console.log("Encrypted:", encrypted);
    
    // Decrypt with private key
    const decrypted = encryption.decryptMessage(encrypted, privateKey);
    console.log("Decrypted:", decrypted);
    
    // Verify
    const success = decrypted === testMessage;
    console.log("Test result:", success ? "SUCCESS" : "FAILED");
    
    return success;
  } catch (error) {
    console.error("Encryption test failed:", error);
    return false;
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testEncryption();
  }, 1000);
}
