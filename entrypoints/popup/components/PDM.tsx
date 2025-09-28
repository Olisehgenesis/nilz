import React, { useState, useEffect } from 'react';
import { Database, Shield, Eye, EyeOff, Plus, Trash2, Key, Lock, Unlock } from 'lucide-react';
import { ReusableButton } from './ReusableButton';
import { ImportedWallet } from '../utils/walletStorage';
import { createNillionKeypair, getDidFromKeypair } from '../utils/nillion';
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
}

export function PDM({ wallet, onBack }: PDMProps) {
  const [privateData, setPrivateData] = useState<PrivateData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedData, setSelectedData] = useState<PrivateData | null>(null);
  const [newDataName, setNewDataName] = useState('');
  const [newDataValue, setNewDataValue] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load private data on component mount
  useEffect(() => {
    loadPrivateData();
  }, [wallet]);

  const loadPrivateData = async () => {
    try {
      // In a real implementation, this would load from Nillion's private storage
      // For now, we'll simulate with localStorage
      const stored = localStorage.getItem(`pdm_data_${wallet.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setPrivateData(data);
        console.log(`Restored ${data.length} private data entries for wallet ${wallet.name}`);
      }
    } catch (error) {
      console.error('Failed to load private data:', error);
      setError('Failed to load private data');
    }
  };

  const savePrivateData = async (data: PrivateData[]) => {
    try {
      localStorage.setItem(`pdm_data_${wallet.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save private data:', error);
      throw error;
    }
  };

  const handleCreateData = async () => {
    if (!newDataName.trim() || !newDataValue.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newData: PrivateData = {
        id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newDataName,
        data: isEncrypted ? { '%allot': newDataValue } : newDataValue,
        encrypted: isEncrypted,
        createdAt: Date.now(),
        permissions: {
          read: true,
          write: true,
          execute: true
        }
      };

      const updatedData = [...privateData, newData];
      setPrivateData(updatedData);
      await savePrivateData(updatedData);

      setShowCreateModal(false);
      setNewDataName('');
      setNewDataValue('');
      setIsEncrypted(true);
    } catch (error) {
      console.error('Failed to create data:', error);
      setError('Failed to create private data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async (dataId: string) => {
    if (confirm('Are you sure you want to delete this private data? This action cannot be undone.')) {
      try {
        const updatedData = privateData.filter(d => d.id !== dataId);
        setPrivateData(updatedData);
        await savePrivateData(updatedData);
      } catch (error) {
        console.error('Failed to delete data:', error);
        setError('Failed to delete private data');
      }
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
        
        {onBack && (
          <ReusableButton variant="secondary" onClick={onBack}>
            Back to Wallets
          </ReusableButton>
        )}
      </div>

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

      {error && (
        <div className="error-message">
          <Shield className="error-icon" />
          {error}
        </div>
      )}

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
              <label htmlFor="dataName">Data Name</label>
              <input
                id="dataName"
                type="text"
                value={newDataName}
                onChange={(e) => setNewDataName(e.target.value)}
                placeholder="e.g., Personal Email"
                className="form-input"
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
                disabled={isLoading}
              >
                Create Data
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
