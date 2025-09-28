#!/usr/bin/env node

/**
 * Demo script for Nilz Private Data Manager
 * 
 * This script demonstrates the key features of the SecretVaults integration:
 * - Collection creation (Standard and Owned)
 * - Data storage with encryption
 * - Access control and permissions
 * - Query operations
 */

import { 
  createBuilderClient, 
  createUserClient, 
  registerBuilderProfile,
  createStandardCollection,
  createOwnedCollection,
  listCollections,
  createStandardData,
  createOwnedData,
  findData,
  grantAccess,
  createDelegationToken,
  createQuery,
  runQuery,
  pollQueryResult,
  COMMON_SCHEMAS
} from './entrypoints/popup/utils/secretVaults.js';

// Demo configuration
const DEMO_CONFIG = {
  apiKey: process.env.NILLION_API_KEY || 'your-api-key-here',
  network: 'testnet' as const,
  operation: 'store' as const
};

// Demo wallet data (replace with actual wallet)
const DEMO_WALLET = {
  id: 'demo-wallet',
  name: 'Demo Wallet',
  did: 'did:nillion:demo123',
  network: 'testnet' as const,
  encryptedPrivateKey: 'encrypted-key',
  salt: 'salt123',
  createdAt: Date.now(),
  lastUsed: Date.now()
};

const DEMO_PASSWORD = 'demo-password';

async function runDemo() {
  console.log('🚀 Starting Nilz Private Data Manager Demo\n');

  try {
    // Step 1: Initialize clients
    console.log('📡 Initializing SecretVaults clients...');
    const builderClient = await createBuilderClient(DEMO_CONFIG, DEMO_WALLET, DEMO_PASSWORD);
    const userClient = await createUserClient(DEMO_CONFIG, DEMO_WALLET, DEMO_PASSWORD);
    
    // Register builder profile
    await registerBuilderProfile(builderClient, 'Demo Builder');
    console.log('✅ Clients initialized successfully\n');

    // Step 2: Create collections
    console.log('📁 Creating collections...');
    
    const standardCollectionId = await createStandardCollection(
      builderClient, 
      'Demo Standard Collection', 
      COMMON_SCHEMAS.personalData
    );
    console.log(`✅ Standard collection created: ${standardCollectionId}`);

    const ownedCollectionId = await createOwnedCollection(
      builderClient, 
      'Demo Owned Collection', 
      COMMON_SCHEMAS.personalData
    );
    console.log(`✅ Owned collection created: ${ownedCollectionId}\n`);

    // Step 3: List collections
    console.log('📋 Listing collections...');
    const collections = await listCollections(builderClient);
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    console.log();

    // Step 4: Create standard data
    console.log('💾 Creating standard data...');
    const standardData = [
      {
        fieldName: 'Public Email',
        fieldValue: 'public@example.com',
        category: 'contact',
        tags: ['email', 'public']
      },
      {
        fieldName: 'Company Name',
        fieldValue: 'Demo Corp',
        category: 'business',
        tags: ['company', 'public']
      }
    ];

    const standardRecordIds = await createStandardData(
      builderClient,
      standardCollectionId,
      standardData
    );
    console.log(`✅ Created ${standardRecordIds.length} standard records\n`);

    // Step 5: Create owned data
    console.log('🔒 Creating owned data...');
    
    // Create delegation token for owned data
    const delegationToken = await createDelegationToken(
      builderClient,
      userClient.getDid(),
      Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    );

    const ownedData = [
      {
        fieldName: 'Private Email',
        fieldValue: { '%allot': 'private@example.com' },
        category: 'personal',
        tags: ['email', 'private']
      },
      {
        fieldName: 'SSN',
        fieldValue: { '%allot': '123-45-6789' },
        category: 'sensitive',
        tags: ['ssn', 'private']
      }
    ];

    const acl = {
      [userClient.getDid()]: {
        read: true,
        write: true,
        execute: true
      }
    };

    const ownedRecordIds = await createOwnedData(
      userClient,
      ownedCollectionId,
      ownedData,
      delegationToken,
      acl
    );
    console.log(`✅ Created ${ownedRecordIds.length} owned records\n`);

    // Step 6: Query data
    console.log('🔍 Querying data...');
    const standardRecords = await findData(builderClient, standardCollectionId);
    console.log(`Found ${standardRecords.length} standard records:`);
    standardRecords.forEach(record => {
      console.log(`  - ${record.fieldName}: ${record.fieldValue}`);
    });
    console.log();

    // Step 7: Create and run a query
    console.log('📊 Creating and running a query...');
    const queryId = await createQuery(
      builderClient,
      standardCollectionId,
      'Count Records by Category',
      [
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            records: { $push: '$fieldName' }
          }
        }
      ]
    );

    const queryResult = await pollQueryResult(builderClient, queryId);
    console.log('Query result:', JSON.stringify(queryResult, null, 2));
    console.log();

    // Step 8: Grant access (simulation)
    console.log('🔑 Granting access to owned data...');
    const granteeDid = 'did:nillion:grantee123';
    
    try {
      await grantAccess(
        userClient,
        ownedCollectionId,
        ownedRecordIds[0],
        granteeDid,
        {
          read: true,
          write: false,
          execute: false
        }
      );
      console.log('✅ Access granted successfully\n');
    } catch (error) {
      console.log('⚠️  Access grant failed (expected in demo):', error.message);
      console.log();
    }

    console.log('🎉 Demo completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`- Created ${collections.length} collections`);
    console.log(`- Stored ${standardRecordIds.length} standard records`);
    console.log(`- Stored ${ownedRecordIds.length} owned records`);
    console.log(`- Executed ${1} query`);
    console.log('\n🔗 Next steps:');
    console.log('1. Install the browser extension');
    console.log('2. Import your wallet with a real private key');
    console.log('3. Enter your Nillion API key');
    console.log('4. Start managing your private data!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure you have a valid Nillion API key');
    console.error('2. Ensure you have testnet NIL tokens');
    console.error('3. Check your network connection');
    console.error('4. Verify the wallet private key is valid');
  }
}

// Run the demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };
