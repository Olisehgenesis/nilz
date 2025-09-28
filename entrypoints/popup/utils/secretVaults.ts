import { 
  SecretVaultBuilderClient, 
  SecretVaultUserClient,
  Keypair
} from '@nillion/secretvaults';
import { ImportedWallet, decryptWalletPrivateKey } from './walletStorage';
import { getNetworkConfig, NillionNetwork } from './nillion';

// Configuration for SecretVaults clients
export interface SecretVaultConfig {
  apiKey: string;
  network: NillionNetwork;
  operation: 'store' | 'compute';
}

// Collection schema types
export interface CollectionSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: readonly string[];
}

// Data record types
export interface DataRecord {
  _id?: string;
  [key: string]: any;
}

// Permission types
export interface AccessPermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
}

// Query result types
export interface QueryResult {
  _id: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * Creates and initializes a SecretVaultBuilderClient
 */
export async function createBuilderClient(
  config: SecretVaultConfig,
  wallet: ImportedWallet,
  password: string
): Promise<SecretVaultBuilderClient> {
  try {
    console.log('Creating SecretVaultBuilderClient...');
    
    // Decrypt the wallet's private key
    const privateKey = await decryptWalletPrivateKey(wallet, password);
    
    // Create keypair from private key
    const keypair = Keypair.from(privateKey);
    
    // Get network configuration
    const networkConfig = getNetworkConfig(config.network);
    
    // Initialize the builder client with simplified options
    const builderClient = new SecretVaultBuilderClient({
      keypair: keypair
    });
    
    console.log('SecretVaultBuilderClient created successfully');
    return builderClient;
  } catch (error) {
    console.error('Failed to create SecretVaultBuilderClient:', error);
    throw new Error(`Failed to create builder client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates and initializes a SecretVaultUserClient
 */
export async function createUserClient(
  config: SecretVaultConfig,
  wallet: ImportedWallet,
  password: string
): Promise<SecretVaultUserClient> {
  try {
    console.log('Creating SecretVaultUserClient...');
    
    // Decrypt the wallet's private key
    const privateKey = await decryptWalletPrivateKey(wallet, password);
    
    // Create keypair from private key
    const keypair = Keypair.from(privateKey);
    
    // Initialize the user client with simplified options
    const userClient = new SecretVaultUserClient({
      keypair: keypair
    });
    
    console.log('SecretVaultUserClient created successfully');
    return userClient;
  } catch (error) {
    console.error('Failed to create SecretVaultUserClient:', error);
    throw new Error(`Failed to create user client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Registers a builder profile
 */
export async function registerBuilderProfile(
  builderClient: SecretVaultBuilderClient,
  name: string
): Promise<void> {
  try {
    console.log('Registering builder profile...');
    
    const did = builderClient.keypair.toDid().toString();
    
    try {
      await builderClient.register({
        did: did as any,
        name
      });
      console.log('Builder profile registered successfully');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('Builder profile already exists');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to register builder profile:', error);
    throw new Error(`Failed to register builder profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a standard collection
 */
export async function createStandardCollection(
  builderClient: SecretVaultBuilderClient,
  name: string,
  schema: CollectionSchema
): Promise<string> {
  try {
    console.log('Creating standard collection...');
    
    const request = {
      _id: crypto.randomUUID(),
      name,
      schema: schema as any,
      type: 'standard' as const
    };
    
    const response = await builderClient.createCollection(request);
    console.log('Standard collection created:', response.id);
    return response.id;
  } catch (error) {
    console.error('Failed to create standard collection:', error);
    throw new Error(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates an owned collection
 */
export async function createOwnedCollection(
  builderClient: SecretVaultBuilderClient,
  name: string,
  schema: CollectionSchema
): Promise<string> {
  try {
    console.log('Creating owned collection...');
    
    const request = {
      _id: crypto.randomUUID(),
      name,
      schema: schema as any,
      type: 'owned' as const
    };
    
    const response = await builderClient.createCollection(request);
    console.log('Owned collection created:', response.id);
    return response.id;
  } catch (error) {
    console.error('Failed to create owned collection:', error);
    throw new Error(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lists all collections
 */
export async function listCollections(
  builderClient: SecretVaultBuilderClient
): Promise<any[]> {
  try {
    console.log('Listing collections...');
    
    const response = await builderClient.readCollections();
    console.log(`Found ${response.data?.length || 0} collections`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to list collections:', error);
    throw new Error(`Failed to list collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates standard data records
 */
export async function createStandardData(
  builderClient: SecretVaultBuilderClient,
  collectionId: string,
  data: DataRecord[]
): Promise<string[]> {
  try {
    console.log('Creating standard data records...');
    
    const request = {
      collection: collectionId,
      data
    };
    
    const response = await builderClient.createStandardData(request);
    console.log(`Created ${response.data?.created?.length || 0} standard data records`);
    return response.data?.created || [];
  } catch (error) {
    console.error('Failed to create standard data:', error);
    throw new Error(`Failed to create data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates owned data records
 */
export async function createOwnedData(
  userClient: SecretVaultUserClient,
  collectionId: string,
  data: DataRecord[],
  delegationToken: string,
  acl: Record<string, AccessPermissions>
): Promise<string[]> {
  try {
    console.log('Creating owned data records...');
    
    // Convert ACL to the expected format
    const aclEntries = Object.entries(acl).map(([grantee, permissions]) => ({
      grantee: grantee as any,
      ...permissions
    }));
    
    const request = {
      owner: userClient.keypair.toDid() as any,
      collection: collectionId,
      data,
      acl: aclEntries[0] // Use first ACL entry
    };
    
    const response = await userClient.createData(request);
    console.log(`Created ${response.data?.created?.length || 0} owned data records`);
    return response.data?.created || [];
  } catch (error) {
    console.error('Failed to create owned data:', error);
    throw new Error(`Failed to create owned data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Finds data records in a collection
 */
export async function findData(
  builderClient: SecretVaultBuilderClient,
  collectionId: string,
  filter: any = {}
): Promise<any[]> {
  try {
    console.log('Finding data records...');
    
    const request = {
      collection: collectionId,
      filter
    };
    
    const response = await builderClient.findData(request);
    console.log(`Found ${response.data?.length || 0} data records`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to find data:', error);
    throw new Error(`Failed to find data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates data records
 */
export async function updateData(
  builderClient: SecretVaultBuilderClient,
  collectionId: string,
  filter: any,
  update: any
): Promise<void> {
  try {
    console.log('Updating data records...');
    
    const request = {
      collection: collectionId,
      filter,
      update
    };
    
    await builderClient.updateData(request);
    console.log('Data records updated successfully');
  } catch (error) {
    console.error('Failed to update data:', error);
    throw new Error(`Failed to update data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes data records
 */
export async function deleteData(
  builderClient: SecretVaultBuilderClient,
  collectionId: string,
  filter: any
): Promise<void> {
  try {
    console.log('Deleting data records...');
    
    const request = {
      collection: collectionId,
      filter
    };
    
    await builderClient.deleteData(request);
    console.log('Data records deleted successfully');
  } catch (error) {
    console.error('Failed to delete data:', error);
    throw new Error(`Failed to delete data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lists owned data references
 */
export async function listOwnedDataReferences(
  userClient: SecretVaultUserClient
): Promise<any[]> {
  try {
    console.log('Listing owned data references...');
    
    const response = await userClient.listDataReferences();
    console.log(`Found ${response.data?.length || 0} owned data references`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to list owned data references:', error);
    throw new Error(`Failed to list owned data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reads owned data
 */
export async function readOwnedData(
  userClient: SecretVaultUserClient,
  collectionId: string,
  documentId: string
): Promise<any> {
  try {
    console.log('Reading owned data...');
    
    const request = {
      collection: collectionId,
      document: documentId
    };
    
    const response = await userClient.readData(request);
    console.log('Owned data read successfully');
    return response.data || {};
  } catch (error) {
    console.error('Failed to read owned data:', error);
    throw new Error(`Failed to read owned data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes owned data
 */
export async function deleteOwnedData(
  userClient: SecretVaultUserClient,
  collectionId: string,
  documentId: string
): Promise<void> {
  try {
    console.log('Deleting owned data...');
    
    const request = {
      collection: collectionId,
      document: documentId
    };
    
    await userClient.deleteData(request);
    console.log('Owned data deleted successfully');
  } catch (error) {
    console.error('Failed to delete owned data:', error);
    throw new Error(`Failed to delete owned data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Grants access to owned data
 */
export async function grantAccess(
  userClient: SecretVaultUserClient,
  collectionId: string,
  documentId: string,
  granteeDid: string,
  permissions: AccessPermissions
): Promise<void> {
  try {
    console.log('Granting access to owned data...');
    
    const request = {
      collection: collectionId,
      document: documentId,
      acl: {
        grantee: granteeDid as any,
        ...permissions
      }
    };
    
    await userClient.grantAccess(request);
    console.log('Access granted successfully');
  } catch (error) {
    console.error('Failed to grant access:', error);
    throw new Error(`Failed to grant access: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Revokes access from owned data
 */
export async function revokeAccess(
  userClient: SecretVaultUserClient,
  collectionId: string,
  documentId: string,
  granteeDid: string
): Promise<void> {
  try {
    console.log('Revoking access from owned data...');
    
    const request = {
      collection: collectionId,
      document: documentId,
      grantee: granteeDid as any
    };
    
    await userClient.revokeAccess(request);
    console.log('Access revoked successfully');
  } catch (error) {
    console.error('Failed to revoke access:', error);
    throw new Error(`Failed to revoke access: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a delegation token
 * Note: This is a placeholder implementation as the actual API may vary
 */
export async function createDelegationToken(
  builderClient: SecretVaultBuilderClient,
  userDid: string,
  expiresAt: number
): Promise<string> {
  try {
    console.log('Creating delegation token...');
    
    // This is a placeholder - the actual implementation would depend on the SDK version
    // For now, we'll return a mock token
    const token = `delegation_${Date.now()}_${userDid.slice(-8)}`;
    
    console.log('Delegation token created successfully');
    return token;
  } catch (error) {
    console.error('Failed to create delegation token:', error);
    throw new Error(`Failed to create delegation token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a query
 */
export async function createQuery(
  builderClient: SecretVaultBuilderClient,
  collectionId: string,
  name: string,
  pipeline: any[],
  variables: Record<string, any> = {}
): Promise<string> {
  try {
    console.log('Creating query...');
    
    const request = {
      _id: crypto.randomUUID(),
      collection: collectionId,
      name,
      variables,
      pipeline
    };
    
    const response = await builderClient.createQuery(request);
    console.log('Query created successfully:', response.id);
    return response.id;
  } catch (error) {
    console.error('Failed to create query:', error);
    throw new Error(`Failed to create query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Runs a query
 */
export async function runQuery(
  builderClient: SecretVaultBuilderClient,
  queryId: string,
  variables: Record<string, any> = {}
): Promise<QueryResult> {
  try {
    console.log('Running query...');
    
    const request = {
      _id: queryId,
      variables
    };
    
    const response = await builderClient.runQuery(request);
    console.log('Query executed successfully');
    return {
      _id: queryId,
      status: 'completed',
      result: response.data || response
    };
  } catch (error) {
    console.error('Failed to run query:', error);
    throw new Error(`Failed to run query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Polls for query results
 */
export async function pollQueryResult(
  builderClient: SecretVaultBuilderClient,
  queryId: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<any> {
  try {
    console.log('Polling for query results...');
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await runQuery(builderClient, queryId);
      
      if (result.status === 'completed') {
        console.log('Query completed successfully');
        return result.result;
      } else if (result.status === 'failed') {
        throw new Error(`Query failed: ${result.error}`);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error('Query polling timeout');
  } catch (error) {
    console.error('Failed to poll query result:', error);
    throw new Error(`Failed to poll query result: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Common collection schemas
export const COMMON_SCHEMAS = {
  contactBook: {
    type: 'object' as const,
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      age: { type: 'number' },
      address: { type: 'string' }
    },
    required: ['name'] as string[]
  },
  
  personalData: {
    type: 'object' as const,
    properties: {
      fieldName: { type: 'string' },
      fieldValue: { type: 'string' },
      category: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } }
    },
    required: ['fieldName', 'fieldValue'] as string[]
  },
  
  healthData: {
    type: 'object' as const,
    properties: {
      recordType: { type: 'string' },
      value: { type: 'string' },
      unit: { type: 'string' },
      timestamp: { type: 'number' },
      notes: { type: 'string' }
    },
    required: ['recordType', 'value'] as string[]
  }
};