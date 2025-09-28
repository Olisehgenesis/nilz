import React, { useState, useEffect } from 'react';
import { Database, Shield, Eye, EyeOff, Plus, Trash2, Key, Lock, Unlock, Settings, Users, Search, Filter } from 'lucide-react';
import { ReusableButton } from './ReusableButton';
import { ImportedWallet } from '../utils/walletStorage';
import { createNillionKeypair, getDidFromKeypair } from '../utils/nillion';
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
  updateData,
  deleteData,
  listOwnedDataReferences,
  readOwnedData,
  deleteOwnedData,
  grantAccess,
  revokeAccess,
  createDelegationToken,
  createQuery,
  runQuery,
  pollQueryResult,
  SecretVaultConfig,
  CollectionSchema,
  DataRecord,
  AccessPermissions,
  COMMON_SCHEMAS
} from '../utils/secretVaults';
import './PDM.css';

interface PDMProps {
  wallet: ImportedWallet;
  onBack?: () => void;
}

interface PrivateData {
  id: string;
  name: string;
  data: any;
  encrypted: boolean;
  createdAt: number;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  collectionId?: string;
  documentId?: string;
  isOwned?: boolean;
}

interface Collection {
  _id: string;
  name: string;
  type: 'standard' | 'owned';
  schema: CollectionSchema;
  createdAt: number;
}

interface PermissionGrant {
  granteeDid: string;
  permissions: AccessPermissions;
  grantedAt: number;
}

export function PDM({ wallet, onBack }: PDMProps) {
  const [privateData, setPrivateData] = useState<PrivateData[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedData, setSelectedData] = useState<PrivateData | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [newDataName, setNewDataName] = useState('');
  const [newDataValue, setNewDataValue] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [builderClient, setBuilderClient] = useState<any>(null);
  const [userClient, setUserClient] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'collections' | 'permissions'>('data');
  const [granteeDid, setGranteeDid] = useState('');
  const [permissionGrants, setPermissionGrants] = useState<PermissionGrant[]>([]);

  // Initialize SecretVaults clients on component mount
  useEffect(() => {
    if (!isInitialized) {
      setShowApiKeyModal(true);
    }
  }, [isInitialized]);

  const initializeSecretVaults = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Nillion API Key');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your wallet password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Initializing SecretVaults clients...');
      
      const config: SecretVaultConfig = {
        apiKey,
        network: wallet.network,
        operation: 'store'
      };

      // Create builder and user clients
      const builder = await createBuilderClient(config, wallet, password);
      const user = await createUserClient(config, wallet, password);

      // Register builder profile
      await registerBuilderProfile(builder, `PDM Builder - ${wallet.name}`);

      setBuilderClient(builder);
      setUserClient(user);
      setIsInitialized(true);
      setShowApiKeyModal(false);

      // Load collections and data
      await loadCollections();
      await loadPrivateData();

      console.log('SecretVaults clients initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SecretVaults:', error);
      setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    if (!builderClient) return;

    try {
      console.log('Loading collections...');
      const collectionsData = await listCollections(builderClient);
      
      const formattedCollections: Collection[] = collectionsData.map((col: any) => ({
        _id: col._id,
        name: col.name,
        type: col.type,
        schema: col.schema,
        createdAt: col.createdAt || Date.now()
      }));

      setCollections(formattedCollections);
      console.log(`Loaded ${formattedCollections.length} collections`);
    } catch (error) {
      console.error('Failed to load collections:', error);
      setError('Failed to load collections');
    }
  };

  const loadPrivateData = async () => {
    if (!userClient) return;

    try {
      console.log('Loading private data...');
      
      // Load owned data references
      const ownedReferences = await listOwnedDataReferences(userClient);
      
      const formattedData: PrivateData[] = [];
      
      for (const ref of ownedReferences) {
        try {
          const data = await readOwnedData(userClient, ref.collection, ref.document);
          formattedData.push({
            id: ref.document,
            name: data.fieldName || `Data ${ref.document.slice(0, 8)}`,
            data: data,
            encrypted: true,
            createdAt: data.createdAt || Date.now(),
            permissions: {
              read: true,
              write: true,
              execute: true
            },
            collectionId: ref.collection,
            documentId: ref.document,
            isOwned: true
          });
        } catch (error) {
          console.error(`Failed to read data ${ref.document}:`, error);
        }
      }

      setPrivateData(formattedData);
      console.log(`Loaded ${formattedData.length} private data entries`);
    } catch (error) {
      console.error('Failed to load private data:', error);
      setError('Failed to load private data');
    }
  };

  const handleCreateData = async () => {
    if (!newDataName.trim() || !newDataValue.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!selectedCollection) {
      setError('Please select a collection');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Creating private data...');
      
      // Prepare data record
      const dataRecord: DataRecord = {
        fieldName: newDataName,
        fieldValue: isEncrypted ? { '%allot': newDataValue } : newDataValue,
        category: 'personal',
        createdAt: Date.now()
      };

      let documentIds: string[] = [];

      if (selectedCollection.type === 'owned') {
        // Create owned data
        const delegationToken = await createDelegationToken(
          builderClient,
          userClient.getDid(),
          Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        );

        const acl = {
          [userClient.getDid()]: {
            read: true,
            write: true,
            execute: true
          }
        };

        documentIds = await createOwnedData(
          userClient,
          selectedCollection._id,
          [dataRecord],
          delegationToken,
          acl
        );
      } else {
        // Create standard data
        documentIds = await createStandardData(
          builderClient,
          selectedCollection._id,
          [dataRecord]
        );
      }

      // Add to local state
      const newData: PrivateData = {
        id: documentIds[0],
        name: newDataName,
        data: dataRecord,
        encrypted: isEncrypted,
        createdAt: Date.now(),
        permissions: {
          read: true,
          write: true,
          execute: true
        },
        collectionId: selectedCollection._id,
        documentId: documentIds[0],
        isOwned: selectedCollection.type === 'owned'
      };

      setPrivateData(prev => [...prev, newData]);

      setShowCreateModal(false);
      setNewDataName('');
      setNewDataValue('');
      setIsEncrypted(true);
      setSelectedCollection(null);

      console.log('Private data created successfully');
    } catch (error) {
      console.error('Failed to create data:', error);
      setError(`Failed to create private data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async (dataId: string) => {
    if (confirm('Are you sure you want to delete this private data? This action cannot be undone.')) {
      try {
        const dataToDelete = privateData.find(d => d.id === dataId);
        if (!dataToDelete) {
          setError('Data not found');
          return;
        }

        if (dataToDelete.isOwned && dataToDelete.collectionId && dataToDelete.documentId) {
          // Delete owned data
          await deleteOwnedData(userClient, dataToDelete.collectionId, dataToDelete.documentId);
        } else if (dataToDelete.collectionId) {
          // Delete standard data
          await deleteData(builderClient, dataToDelete.collectionId, { _id: dataToDelete.documentId });
        }

        // Remove from local state
        setPrivateData(prev => prev.filter(d => d.id !== dataId));
        console.log('Private data deleted successfully');
      } catch (error) {
        console.error('Failed to delete data:', error);
        setError(`Failed to delete private data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCreateCollection = async (name: string, type: 'standard' | 'owned') => {
    if (!name.trim()) {
      setError('Please enter a collection name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log(`Creating ${type} collection...`);
      
      let collectionId: string;
      
      if (type === 'owned') {
        collectionId = await createOwnedCollection(builderClient, name, COMMON_SCHEMAS.personalData as CollectionSchema);
      } else {
        collectionId = await createStandardCollection(builderClient, name, COMMON_SCHEMAS.personalData as CollectionSchema);
      }

      // Add to local state
      const newCollection: Collection = {
        _id: collectionId,
        name,
        type,
        schema: COMMON_SCHEMAS.personalData as CollectionSchema,
        createdAt: Date.now()
      };

      setCollections(prev => [...prev, newCollection]);
      setShowCollectionModal(false);

      console.log(`${type} collection created successfully`);
    } catch (error) {
      console.error('Failed to create collection:', error);
      setError(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!granteeDid.trim()) {
      setError('Please enter a grantee DID');
      return;
    }

    if (!selectedData || !selectedData.collectionId || !selectedData.documentId) {
      setError('No data selected for access grant');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Granting access...');
      
      const permissions: AccessPermissions = {
        read: true,
        write: false,
        execute: false
      };

      await grantAccess(
        userClient,
        selectedData.collectionId,
        selectedData.documentId,
        granteeDid,
        permissions
      );

      // Add to local grants
      setPermissionGrants(prev => [...prev, {
        granteeDid,
        permissions,
        grantedAt: Date.now()
      }]);

      setShowAccessModal(false);
      setGranteeDid('');
      console.log('Access granted successfully');
    } catch (error) {
      console.error('Failed to grant access:', error);
      setError(`Failed to grant access: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagePermissions = (data: PrivateData) => {
    setSelectedData(data);
    setShowPermissionsModal(true);
  };

  const formatDid = (did: string) => {
    return `${did.slice(0, 8)}...${did.slice(-8)}`;
  };

  const formatDataValue = (data: any) => {
    if (typeof data === 'object' && data['%allot']) {
      return '[Encrypted Data]';
    }
    return String(data);
  };

  return (
    <div className="pdm-container">
      <div className="pdm-header">
        <div className="pdm-title">
          <h2>
            <Database className="header-icon" />
            Private Data Manager
          </h2>
          <p>Manage your private data with Nillion's secure storage</p>
        </div>
        
        <div className="pdm-header-actions">
          {!isInitialized && (
            <ReusableButton 
              variant="primary"
              onClick={() => setShowApiKeyModal(true)}
            >
              <Key className="icon" />
              Initialize
            </ReusableButton>
          )}
          
          {isInitialized && (
            <ReusableButton 
              variant="primary"
              onClick={() => setShowCollectionModal(true)}
            >
              <Plus className="icon" />
              New Collection
            </ReusableButton>
          )}
        
        {onBack && (
          <ReusableButton variant="secondary" onClick={onBack}>
            Back to Wallets
          </ReusableButton>
        )}
        </div>
      </div>

      {!isInitialized ? (
        <div className="initialization-prompt">
          <div className="prompt-card">
            <Key className="prompt-icon" />
            <h3>Initialize SecretVaults</h3>
            <p>Enter your Nillion API Key and wallet password to start managing your private data</p>
            <ReusableButton 
              variant="primary"
              onClick={() => setShowApiKeyModal(true)}
            >
              Get Started
            </ReusableButton>
          </div>
        </div>
      ) : (
        <>
      <div className="pdm-wallet-info">
        <div className="wallet-info-card">
          <h3>
            <Key className="icon" />
            Active Wallet
          </h3>
          <p><strong>Name:</strong> {wallet.name}</p>
          <p><strong>DID:</strong> {formatDid(wallet.did)}</p>
          <p><strong>Network:</strong> {wallet.network === 'testnet' ? 'Nillion Testnet' : 'Nillion Mainnet'}</p>
        </div>
      </div>

          {/* Tab Navigation */}
          <div className="pdm-tabs">
            <button 
              className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              <Database className="icon" />
              Private Data
            </button>
            <button 
              className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              <Settings className="icon" />
              Collections
            </button>
            <button 
              className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <Users className="icon" />
              Permissions
            </button>
      </div>

      {error && (
        <div className="error-message">
          <Shield className="error-icon" />
          {error}
        </div>
      )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <>
      <div className="pdm-actions">
        <ReusableButton 
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="icon" />
          Create Private Data
        </ReusableButton>
      </div>

      <div className="pdm-data-list">
        {privateData.length === 0 ? (
          <div className="empty-state">
            <Database className="empty-icon" />
            <h3>No private data stored</h3>
            <p>Create your first private data entry to get started</p>
          </div>
        ) : (
          privateData.map((data) => (
            <div key={data.id} className="data-card">
              <div className="data-info">
                <div className="data-header">
                  <h3>{data.name}</h3>
                  <div className="data-badges">
                    {data.encrypted && (
                      <span className="encrypted-badge">
                        <Lock className="badge-icon" />
                        Encrypted
                      </span>
                    )}
                            {data.isOwned && (
                              <span className="owned-badge">
                                <Key className="badge-icon" />
                                Owned
                      </span>
                    )}
                    <span className="created-badge">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="data-value">{formatDataValue(data.data)}</p>
                <div className="permissions-info">
                  <span className={`permission ${data.permissions.read ? 'granted' : 'denied'}`}>
                    Read: {data.permissions.read ? '✓' : '✗'}
                  </span>
                  <span className={`permission ${data.permissions.write ? 'granted' : 'denied'}`}>
                    Write: {data.permissions.write ? '✓' : '✗'}
                  </span>
                  <span className={`permission ${data.permissions.execute ? 'granted' : 'denied'}`}>
                    Execute: {data.permissions.execute ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              <div className="data-actions">
                        {data.isOwned && (
                          <ReusableButton 
                            variant="secondary"
                            onClick={() => {
                              setSelectedData(data);
                              setShowAccessModal(true);
                            }}
                          >
                            <Users className="icon" />
                            Grant Access
                          </ReusableButton>
                        )}
                <ReusableButton 
                  variant="secondary"
                  onClick={() => handleManagePermissions(data)}
                >
                  <Eye className="icon" />
                  Permissions
                </ReusableButton>
                <ReusableButton 
                  variant="secondary"
                  onClick={() => handleDeleteData(data.id)}
                >
                  <Trash2 className="icon" />
                </ReusableButton>
              </div>
            </div>
          ))
        )}
      </div>
            </>
          )}

          {/* Collections Tab */}
          {activeTab === 'collections' && (
            <div className="collections-list">
              {collections.length === 0 ? (
                <div className="empty-state">
                  <Settings className="empty-icon" />
                  <h3>No collections created</h3>
                  <p>Create your first collection to organize your private data</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <div key={collection._id} className="collection-card">
                    <div className="collection-info">
                      <h3>{collection.name}</h3>
                      <div className="collection-badges">
                        <span className={`type-badge ${collection.type}`}>
                          {collection.type === 'owned' ? 'Owned' : 'Standard'}
                        </span>
                        <span className="created-badge">
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="collection-actions">
                      <ReusableButton 
                        variant="secondary"
                        onClick={() => {
                          setSelectedCollection(collection);
                          setShowCreateModal(true);
                        }}
                      >
                        <Plus className="icon" />
                        Add Data
                      </ReusableButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="permissions-list">
              {permissionGrants.length === 0 ? (
                <div className="empty-state">
                  <Users className="empty-icon" />
                  <h3>No access grants</h3>
                  <p>Grant access to your private data to see permissions here</p>
                </div>
              ) : (
                permissionGrants.map((grant, index) => (
                  <div key={index} className="permission-card">
                    <div className="permission-info">
                      <h3>Access Grant</h3>
                      <p><strong>Grantee:</strong> {formatDid(grant.granteeDid)}</p>
                      <p><strong>Granted:</strong> {new Date(grant.grantedAt).toLocaleDateString()}</p>
                      <div className="permission-details">
                        <span className={`permission ${grant.permissions.read ? 'granted' : 'denied'}`}>
                          Read: {grant.permissions.read ? '✓' : '✗'}
                        </span>
                        <span className={`permission ${grant.permissions.write ? 'granted' : 'denied'}`}>
                          Write: {grant.permissions.write ? '✓' : '✗'}
                        </span>
                        <span className={`permission ${grant.permissions.execute ? 'granted' : 'denied'}`}>
                          Execute: {grant.permissions.execute ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Create Data Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content create-modal">
            <h3>
              <Plus className="icon" />
              Create Private Data
            </h3>
            <p>Store your private data securely with Nillion</p>
            
            <div className="form-group">
              <label htmlFor="collectionSelect">Collection</label>
              <select
                id="collectionSelect"
                value={selectedCollection?._id || ''}
                onChange={(e) => {
                  const collection = collections.find(c => c._id === e.target.value);
                  setSelectedCollection(collection || null);
                }}
                className="form-select"
                required
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name} ({collection.type})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dataName">Data Name</label>
              <input
                id="dataName"
                type="text"
                value={newDataName}
                onChange={(e) => setNewDataName(e.target.value)}
                placeholder="e.g., Personal Email"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dataValue">Data Value</label>
              <textarea
                id="dataValue"
                value={newDataValue}
                onChange={(e) => setNewDataValue(e.target.value)}
                placeholder="Enter your private data here..."
                className="form-textarea"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isEncrypted}
                  onChange={(e) => setIsEncrypted(e.target.checked)}
                />
                <span className="checkmark"></span>
                Encrypt this data (recommended)
              </label>
            </div>

            <div className="modal-actions">
              <ReusableButton 
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDataName('');
                  setNewDataValue('');
                  setIsEncrypted(true);
                  setSelectedCollection(null);
                  setError('');
                }}
                disabled={isLoading}
              >
                Cancel
              </ReusableButton>
              <ReusableButton 
                variant="primary"
                onClick={handleCreateData}
                isLoading={isLoading}
                disabled={isLoading || !selectedCollection}
              >
                Create Data
              </ReusableButton>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-overlay">
          <div className="modal-content api-key-modal">
            <h3>
              <Key className="icon" />
              Initialize SecretVaults
            </h3>
            <p>Enter your Nillion API Key and wallet password to start managing your private data</p>
            
            <div className="form-group">
              <label htmlFor="apiKey">Nillion API Key</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Nillion API Key"
                className="form-input"
                required
              />
              <small>Get your API key from the <a href="https://docs.nillion.com/build/network-api-access" target="_blank" rel="noopener noreferrer">Nillion documentation</a></small>
            </div>

            <div className="form-group">
              <label htmlFor="walletPassword">Wallet Password</label>
              <div className="password-input">
                <input
                  id="walletPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your wallet password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="import-progress">
                <div className="progress-spinner"></div>
                <p>Initializing SecretVaults clients...</p>
              </div>
            )}

            <div className="modal-actions">
              <ReusableButton 
                variant="secondary"
                onClick={() => {
                  setShowApiKeyModal(false);
                  setApiKey('');
                  setPassword('');
                  setError('');
                }}
                disabled={isLoading}
              >
                Cancel
              </ReusableButton>
              <ReusableButton 
                variant="primary"
                onClick={initializeSecretVaults}
                isLoading={isLoading}
                disabled={isLoading || !apiKey.trim() || !password.trim()}
              >
                Initialize
              </ReusableButton>
            </div>
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="modal-overlay">
          <div className="modal-content collection-modal">
            <h3>
              <Settings className="icon" />
              Create Collection
            </h3>
            <p>Create a new collection to organize your private data</p>
            
            <div className="form-group">
              <label htmlFor="collectionName">Collection Name</label>
              <input
                id="collectionName"
                type="text"
                placeholder="e.g., Personal Data"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Collection Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="collectionType" value="standard" defaultChecked />
                  <span className="radio-custom"></span>
                  Standard Collection
                  <small>Data is managed by the builder client</small>
                </label>
                <label className="radio-label">
                  <input type="radio" name="collectionType" value="owned" />
                  <span className="radio-custom"></span>
                  Owned Collection
                  <small>You own and control access to the data</small>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <ReusableButton 
                variant="secondary"
                onClick={() => setShowCollectionModal(false)}
                disabled={isLoading}
              >
                Cancel
              </ReusableButton>
              <ReusableButton 
                variant="primary"
                onClick={() => {
                  const nameInput = document.getElementById('collectionName') as HTMLInputElement;
                  const typeInput = document.querySelector('input[name="collectionType"]:checked') as HTMLInputElement;
                  if (nameInput && typeInput) {
                    handleCreateCollection(nameInput.value, typeInput.value as 'standard' | 'owned');
                  }
                }}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Collection
              </ReusableButton>
            </div>
          </div>
        </div>
      )}

      {/* Access Grant Modal */}
      {showAccessModal && selectedData && (
        <div className="modal-overlay">
          <div className="modal-content access-modal">
            <h3>
              <Users className="icon" />
              Grant Access
            </h3>
            <p>Grant access to "{selectedData.name}" to another user</p>
            
            <div className="form-group">
              <label htmlFor="granteeDid">Grantee DID</label>
              <input
                id="granteeDid"
                type="text"
                value={granteeDid}
                onChange={(e) => setGranteeDid(e.target.value)}
                placeholder="Enter the recipient's DID"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Permissions</label>
              <div className="permission-checkboxes">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Read Access
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Write Access
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Execute Access
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <ReusableButton 
                variant="secondary"
                onClick={() => {
                  setShowAccessModal(false);
                  setGranteeDid('');
                  setSelectedData(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </ReusableButton>
              <ReusableButton 
                variant="primary"
                onClick={handleGrantAccess}
                isLoading={isLoading}
                disabled={isLoading || !granteeDid.trim()}
              >
                Grant Access
              </ReusableButton>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedData && (
        <div className="modal-overlay">
          <div className="modal-content permissions-modal">
            <h3>
              <Eye className="icon" />
              Manage Permissions
            </h3>
            <p>Control access to your private data</p>
            
            <div className="permissions-section">
              <h4>Current Permissions for "{selectedData.name}"</h4>
              <div className="permissions-list">
                <div className="permission-item">
                  <span className="permission-label">Read Access</span>
                  <span className={`permission-status ${selectedData.permissions.read ? 'granted' : 'denied'}`}>
                    {selectedData.permissions.read ? 'Granted' : 'Denied'}
                  </span>
                </div>
                <div className="permission-item">
                  <span className="permission-label">Write Access</span>
                  <span className={`permission-status ${selectedData.permissions.write ? 'granted' : 'denied'}`}>
                    {selectedData.permissions.write ? 'Granted' : 'Denied'}
                  </span>
                </div>
                <div className="permission-item">
                  <span className="permission-label">Execute Access</span>
                  <span className={`permission-status ${selectedData.permissions.execute ? 'granted' : 'denied'}`}>
                    {selectedData.permissions.execute ? 'Granted' : 'Denied'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <ReusableButton 
                variant="secondary"
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedData(null);
                }}
              >
                Close
              </ReusableButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
