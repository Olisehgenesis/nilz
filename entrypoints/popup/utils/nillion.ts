import { Keypair } from '@nillion/nuc';

// Nillion Network Configurations
export const NILLION_NETWORKS = {
  testnet: {
    chainId: 'nillion-chain-testnet-1',
    rpcUrl: 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
    restUrl: 'https://api.testnet.nilchain-rpc-proxy.nilogy.xyz',
    grpcUrl: 'https://testnet-nillion-grpc.lavenderfive.com',
    nilauthUrl: 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
    nildbNodes: [
      'https://nildb-stg-n1.nillion.network',
      'https://nildb-stg-n2.nillion.network',
      'https://nildb-stg-n3.nillion.network'
    ],
    name: 'Nillion Testnet',
    symbol: 'NIL',
    decimals: 18,
    explorerUrl: 'https://testnet.nillion.network'
  },
  mainnet: {
    chainId: 'nillion-1',
    rpcUrl: 'http://nilchain-rpc.nillion.network',
    restUrl: 'https://nilchain-api.nillion.network',
    grpcUrl: 'https://nillion-grpc.lavenderfive.com',
    nilauthUrl: 'https://nilauth-cf7f.nillion.network',
    nildbNodes: [
      'https://nildb-5ab1.nillion.network',
      'https://nildb-8001.cloudician.xyz',
      'https://nildb-f496.pairpointweb3.io',
      'https://nildb-f375.stcbahrain.net',
      'https://nildb-2140.staking.telekom-mms.com'
    ],
    name: 'Nillion Mainnet',
    symbol: 'NIL',
    decimals: 18,
    explorerUrl: 'https://nillion.network'
  }
} as const;

export type NillionNetwork = keyof typeof NILLION_NETWORKS;

/**
 * Creates a Nillion keypair from a private key
 * @param privateKey - The private key (hex string)
 * @returns A Nillion Keypair instance
 */
export function createNillionKeypair(privateKey: string): Keypair {
  try {
    console.log('Creating Nillion keypair from private key...');
    
    // Remove 0x prefix if present
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Validate private key length (should be 64 hex characters for 32 bytes)
    if (cleanPrivateKey.length !== 64) {
      throw new Error('Private key must be exactly 64 hex characters');
    }
    
    // Validate hex format
    if (!/^[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
      throw new Error('Private key must contain only valid hex characters');
    }
    
    const keypair = Keypair.from(cleanPrivateKey);
    console.log('Nillion keypair created successfully');
    return keypair;
  } catch (error) {
    console.error('Failed to create Nillion keypair:', error);
    throw new Error(`Failed to create Nillion keypair: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a new random Nillion keypair
 * @returns A new random Nillion Keypair
 */
export function generateNillionKeypair(): Keypair {
  try {
    console.log('Generating new Nillion keypair...');
    const keypair = Keypair.generate();
    console.log('New Nillion keypair generated successfully');
    return keypair;
  } catch (error) {
    console.error('Failed to generate Nillion keypair:', error);
    throw new Error(`Failed to generate Nillion keypair: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the DID (Decentralized Identifier) from a keypair
 * @param keypair - The Nillion keypair
 * @returns The DID string
 */
export function getDidFromKeypair(keypair: Keypair): string {
  try {
    const did = keypair.toDid().toString();
    console.log('DID generated:', did);
    return did;
  } catch (error) {
    console.error('Failed to get DID from keypair:', error);
    throw new Error(`Failed to get DID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates a private key format
 * @param privateKey - The private key to validate
 * @returns True if the private key format is valid
 */
export function validatePrivateKey(privateKey: string): boolean {
  try {
    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Check if it's a valid hex string and 64 characters long (32 bytes)
    return /^[0-9a-fA-F]{64}$/.test(cleanKey);
  } catch (error) {
    console.error('Error validating private key:', error);
    return false;
  }
}

/**
 * Gets the network configuration for a specific network
 * @param network - The Nillion network
 * @returns The network configuration
 */
export function getNetworkConfig(network: NillionNetwork) {
  return NILLION_NETWORKS[network];
}
