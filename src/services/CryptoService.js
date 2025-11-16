/**
 * End-to-End Encryption Service using Web Crypto API
 * Implements RSA-OAEP for key exchange and AES-GCM for message encryption
 */
class CryptoService {
  constructor() {
    this.keyPair = null;
    this.publicKeys = new Map(); // username -> publicKey
  }

  /**
   * Generate RSA key pair for user
   * @returns {Promise<CryptoKeyPair>}
   */
  async generateKeyPair() {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      
      return this.keyPair;
    } catch (error) {
      console.error('Failed to generate key pair:', error);
      throw new Error('Key generation failed');
    }
  }

  /**
   * Export public key to base64 string
   * @param {CryptoKey} publicKey
   * @returns {Promise<string>}
   */
  async exportPublicKey(publicKey = this.keyPair?.publicKey) {
    if (!publicKey) {
      throw new Error('No public key available');
    }

    try {
      const exported = await window.crypto.subtle.exportKey('spki', publicKey);
      const exportedAsBase64 = btoa(
        String.fromCharCode(...new Uint8Array(exported))
      );
      return exportedAsBase64;
    } catch (error) {
      console.error('Failed to export public key:', error);
      throw error;
    }
  }

  /**
   * Import public key from base64 string
   * @param {string} base64Key
   * @returns {Promise<CryptoKey>}
   */
  async importPublicKey(base64Key) {
    try {
      const binaryString = atob(base64Key);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        bytes,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );

      return publicKey;
    } catch (error) {
      console.error('Failed to import public key:', error);
      throw error;
    }
  }

  /**
   * Export private key encrypted with password
   * @param {string} password
   * @returns {Promise<string>} Base64 encrypted private key
   */
  async exportEncryptedPrivateKey(password) {
    if (!this.keyPair?.privateKey) {
      throw new Error('No private key available');
    }

    try {
      // Export private key
      const exported = await window.crypto.subtle.exportKey(
        'pkcs8',
        this.keyPair.privateKey
      );

      // Derive encryption key from password
      const encryptionKey = await this.deriveKeyFromPassword(password);

      // Generate IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt private key
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        exported
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Failed to export encrypted private key:', error);
      throw error;
    }
  }

  /**
   * Import private key from encrypted base64 string
   * @param {string} encryptedBase64
   * @param {string} password
   * @returns {Promise<CryptoKey>}
   */
  async importEncryptedPrivateKey(encryptedBase64, password) {
    try {
      // Decode base64
      const binaryString = atob(encryptedBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Extract IV and encrypted data
      const iv = bytes.slice(0, 12);
      const encryptedData = bytes.slice(12);

      // Derive decryption key from password
      const decryptionKey = await this.deriveKeyFromPassword(password);

      // Decrypt private key
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        decryptionKey,
        encryptedData
      );

      // Import private key
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        decrypted,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['decrypt']
      );

      return privateKey;
    } catch (error) {
      console.error('Failed to import encrypted private key:', error);
      throw new Error('Invalid password or corrupted key');
    }
  }

  /**
   * Derive AES key from password using PBKDF2
   * @param {string} password
   * @returns {Promise<CryptoKey>}
   */
  async deriveKeyFromPassword(password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Use a fixed salt for simplicity (in production, store salt with encrypted key)
    const salt = encoder.encode('retro-messenger-salt-2025');

    // Derive AES key
    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt message for recipient
   * @param {string} message - Plain text message
   * @param {string} recipientUsername - Recipient username
   * @returns {Promise<string>} Base64 encrypted message
   */
  async encryptMessage(message, recipientUsername) {
    const recipientPublicKey = this.publicKeys.get(recipientUsername);
    if (!recipientPublicKey) {
      throw new Error(`No public key for ${recipientUsername}`);
    }

    try {
      // Generate random AES key for this message
      const messageKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Encrypt message with AES
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      const encryptedMessage = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        messageKey,
        messageBuffer
      );

      // Export AES key
      const exportedKey = await window.crypto.subtle.exportKey('raw', messageKey);

      // Encrypt AES key with recipient's public key
      const encryptedKey = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        recipientPublicKey,
        exportedKey
      );

      // Combine encrypted key, IV, and encrypted message
      const combined = {
        encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey))),
        iv: btoa(String.fromCharCode(...iv)),
        encryptedMessage: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))),
      };

      return JSON.stringify(combined);
    } catch (error) {
      console.error('Failed to encrypt message:', error);
      throw error;
    }
  }

  /**
   * Decrypt message from sender
   * @param {string} encryptedData - Base64 encrypted message bundle
   * @returns {Promise<string>} Plain text message
   */
  async decryptMessage(encryptedData) {
    if (!this.keyPair?.privateKey) {
      throw new Error('No private key available');
    }

    try {
      const { encryptedKey, iv, encryptedMessage } = JSON.parse(encryptedData);

      // Decode base64
      const encryptedKeyBytes = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
      const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
      const encryptedMessageBytes = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));

      // Decrypt AES key with private key
      const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        this.keyPair.privateKey,
        encryptedKeyBytes
      );

      // Import AES key
      const messageKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedKeyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt message
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        messageKey,
        encryptedMessageBytes
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Store recipient's public key
   * @param {string} username
   * @param {string} publicKeyBase64
   */
  async storePublicKey(username, publicKeyBase64) {
    try {
      const publicKey = await this.importPublicKey(publicKeyBase64);
      this.publicKeys.set(username, publicKey);
    } catch (error) {
      console.error(`Failed to store public key for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get current key pair
   */
  getKeyPair() {
    return this.keyPair;
  }

  /**
   * Set key pair (for loading from storage)
   */
  setKeyPair(keyPair) {
    this.keyPair = keyPair;
  }

  /**
   * Clear all keys (logout)
   */
  clearKeys() {
    this.keyPair = null;
    this.publicKeys.clear();
  }

  /**
   * Check if private key is available
   * @returns {boolean}
   */
  hasPrivateKey() {
    return !!this.keyPair?.privateKey;
  }
}

// Export singleton instance
export const cryptoService = new CryptoService();
export default CryptoService;
