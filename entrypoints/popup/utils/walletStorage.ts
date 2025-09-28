import { validatePrivateKey, createNillionKeypair, generateNillionKeypair, getDidFromKeypair, NillionNetwork } from './nillion';

export interface ImportedWallet {
  id: string;
  name: string;
  did: string;
  network: NillionNetwork;
  encryptedPrivateKey: string;
  salt: string;
  createdAt: number;
  lastUsed: number;
}

export interface WalletStorage {
  importedWallets: ImportedWallet[];
  activeWalletId?: string;
}

/**
 * Stores an imported wallet securely for both testnet and mainnet
 * @param privateKey - The private key to store
 * @param password - The password for encryption
 * @param name - Optional wallet name
 * @returns The stored wallet data for both networks
 */
export async function storeImportedWallet(
  privateKey: string,
  password: string,
  name?: string
): Promise<ImportedWallet[]> {
  try {
    console.log('Validating private key...');
    if (!validatePrivateKey(privateKey)) {
      throw new Error('Invalid private key format. Please enter a valid 64-character hex string.');
    }

    console.log('Private key validation passed');
    const wallets: ImportedWallet[] = [];
    
    // Create wallets for both networks
    for (const network of ['testnet', 'mainnet'] as NillionNetwork[]) {
      try {
        console.log(`Creating wallet for ${network}...`);
        
        // Create keypair from private key
        const keypair = createNillionKeypair(privateKey);
        const did = getDidFromKeypair(keypair);
        
        console.log(`DID generated for ${network}:`, did);
        
        // Simple encryption using browser's built-in crypto (for demo purposes)
        // In production, you'd want more robust encryption
        const salt = generateSalt();
        const encryptedPrivateKey = await encryptPrivateKey(privateKey, password, salt);
        
        const wallet: ImportedWallet = {
          id: `wallet_${Date.now()}_${network}_${Math.random().toString(36).substr(2, 9)}`,
          name: name || `Wallet ${did.slice(0, 8)}...`,
          did,
          network,
          encryptedPrivateKey,
          salt,
          createdAt: Date.now(),
          lastUsed: Date.now()
        };
        
        wallets.push(wallet);
        console.log(`Wallet created for ${network}:`, wallet.id);
      } catch (networkError) {
        console.error(`Failed to create wallet for ${network}:`, networkError);
        throw new Error(`Failed to create wallet for ${network}: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`);
      }
    }

    console.log('Getting existing wallet data...');
    const existingData = await getStoredWallets();
    const updatedWallets = [...existingData.importedWallets, ...wallets];
    
    console.log('Storing wallets in Chrome storage...');
    // Store in Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set(
          { walletStorage: { ...existingData, importedWallets: updatedWallets } },
          () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError);
              reject(new Error(`Storage error: ${chrome.runtime.lastError.message}`));
            } else {
              console.log('Wallets stored successfully');
              resolve();
            }
          }
        );
      });
    } else {
      throw new Error('Chrome storage not available');
    }

    console.log('Wallet import completed successfully');
    return wallets;
  } catch (error) {
    console.error('Error in storeImportedWallet:', error);
    throw error; // Re-throw to preserve the original error
  }
}

/**
 * Retrieves stored wallets
 * @returns The stored wallet data
 */
export async function getStoredWallets(): Promise<WalletStorage> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['walletStorage'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result.walletStorage || { importedWallets: [], activeWalletId: undefined });
        }
      });
    });
  }
  return { importedWallets: [], activeWalletId: undefined };
}

/**
 * Generates a random salt for additional security
 * @returns A random salt string
 */
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts a private key using Web Crypto API
 * @param privateKey - The private key to encrypt
 * @param password - The password to use for encryption
 * @param salt - The salt for encryption
 * @returns The encrypted private key
 */
async function encryptPrivateKey(privateKey: string, password: string, salt: string): Promise<string> {
  try {
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key from password and salt
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt the private key
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(privateKey)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a private key using Web Crypto API
 * @param encryptedPrivateKey - The encrypted private key
 * @param password - The password to use for decryption
 * @param salt - The salt for decryption
 * @returns The decrypted private key
 */
async function decryptPrivateKey(encryptedPrivateKey: string, password: string, salt: string): Promise<string> {
  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedPrivateKey).split('').map(char => char.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key from password and salt
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt the private key
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a wallet's private key
 * @param wallet - The wallet to decrypt
 * @param password - The password for decryption
 * @returns The decrypted private key
 */
export async function decryptWalletPrivateKey(wallet: ImportedWallet, password: string): Promise<string> {
  return await decryptPrivateKey(wallet.encryptedPrivateKey, password, wallet.salt);
}

/**
 * Updates wallet usage timestamp
 * @param walletId - The wallet ID to update
 */
export async function updateWalletUsage(walletId: string): Promise<void> {
  const walletData = await getStoredWallets();
  const updatedWallets = walletData.importedWallets.map(wallet => 
    wallet.id === walletId 
      ? { ...wallet, lastUsed: Date.now() }
      : wallet
  );
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(
        { walletStorage: { ...walletData, importedWallets: updatedWallets } },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  }
}

/**
 * Sets the active wallet
 * @param walletId - The wallet ID to set as active
 */
export async function setActiveWallet(walletId: string): Promise<void> {
  const walletData = await getStoredWallets();
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(
        { walletStorage: { ...walletData, activeWalletId: walletId } },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  }
}

/**
 * Removes a wallet
 * @param walletId - The wallet ID to remove
 */
export async function removeWallet(walletId: string): Promise<void> {
  const walletData = await getStoredWallets();
  const updatedWallets = walletData.importedWallets.filter(wallet => wallet.id !== walletId);
  const updatedActiveWalletId = walletData.activeWalletId === walletId ? undefined : walletData.activeWalletId;
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(
        { walletStorage: { importedWallets: updatedWallets, activeWalletId: updatedActiveWalletId } },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  }
}
