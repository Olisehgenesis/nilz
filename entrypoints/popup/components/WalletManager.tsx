import React, { useState, useEffect } from 'react';
import { Download, Key, Shield, Eye, EyeOff, Trash2, Plus, Network, Database, Copy, Check } from 'lucide-react';
import { ReusableButton } from './ReusableButton';
import { PDM } from './PDM';
import { storeImportedWallet, getStoredWallets, decryptWalletPrivateKey, removeWallet, setActiveWallet, ImportedWallet, WalletStorage } from '../utils/walletStorage';
import { validatePrivateKey, NillionNetwork, NILLION_NETWORKS } from '../utils/nillion';
import './WalletManager.css';

interface WalletManagerProps {
  onWalletSelect?: (wallet: ImportedWallet) => void;
  onClose?: () => void;
}

export function WalletManager({ onWalletSelect, onClose }: WalletManagerProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletName, setWalletName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [storedWallets, setStoredWallets] = useState<ImportedWallet[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<NillionNetwork | 'all'>('all');
  const [showPDM, setShowPDM] = useState(false);
  const [selectedWalletForPDM, setSelectedWalletForPDM] = useState<ImportedWallet | null>(null);
  const [copiedDid, setCopiedDid] = useState<string | null>(null);

  // Load stored wallets on component mount
  useEffect(() => {
    loadStoredWallets();
  }, []);

  const loadStoredWallets = async () => {
    try {
      const walletData = await getStoredWallets();
      setStoredWallets(walletData.importedWallets);
      setActiveWalletId(walletData.activeWalletId);
      
      // Show success message if wallets were restored
      if (walletData.importedWallets.length > 0) {
        console.log(`Restored ${walletData.importedWallets.length} wallet(s) from storage`);
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
      setError('Failed to load stored wallets');
    }
  };

  const handleImportWallet = async () => {
    setError('');
    
    if (!privateKey.trim()) {
      setError('Please enter a private key');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePrivateKey(privateKey)) {
      setError('Invalid private key format. Please enter a valid 64-character hex string.');
      return;
    }

    setIsImporting(true);
    setError(''); // Clear any previous errors
    
    try {
      console.log('Starting wallet import process...');
      
      const wallets = await storeImportedWallet(
        privateKey,
        password,
        walletName || undefined
      );
      
      console.log('Wallets created successfully:', wallets);
      
      await loadStoredWallets();
      
      // Show success message briefly
      setError('Wallet imported successfully!');
      setTimeout(() => {
        setShowImportModal(false);
        setPrivateKey('');
        setPassword('');
        setConfirmPassword('');
        setWalletName('');
        setError('');
      }, 1500);
      
    } catch (error) {
      console.error('Import failed with error:', error);
      
      let errorMessage = 'Failed to import wallet';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      console.error('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleWalletSelect = async (wallet: ImportedWallet) => {
    await setActiveWallet(wallet.id);
    setActiveWalletId(wallet.id);
    onWalletSelect?.(wallet);
  };

  const handleImportNewWallet = () => {
    setShowImportModal(true);
  };

  const handleCopyDid = async (did: string) => {
    try {
      await navigator.clipboard.writeText(did);
      setCopiedDid(did);
      setTimeout(() => setCopiedDid(null), 2000);
    } catch (error) {
      console.error('Failed to copy DID:', error);
    }
  };

  const handleOpenPDM = (wallet: ImportedWallet) => {
    setSelectedWalletForPDM(wallet);
    setShowPDM(true);
  };

  const handleRemoveWallet = async (walletId: string) => {
    if (confirm('Are you sure you want to remove this wallet? This action cannot be undone.')) {
      try {
        await removeWallet(walletId);
        await loadStoredWallets();
      } catch (error) {
        console.error('Failed to remove wallet:', error);
        setError('Failed to remove wallet');
      }
    }
  };

  const formatDid = (did: string) => {
    return `${did.slice(0, 8)}...${did.slice(-8)}`;
  };

  const getNetworkDisplayName = (network: NillionNetwork) => {
    return NILLION_NETWORKS[network].name;
  };

  // Filter wallets based on selected network
  const filteredWallets = selectedNetworkFilter === 'all' 
    ? storedWallets 
    : storedWallets.filter(wallet => wallet.network === selectedNetworkFilter);

  if (showPDM && selectedWalletForPDM) {
    return <PDM wallet={selectedWalletForPDM} onBack={() => setShowPDM(false)} />;
  }

  return (
    <div className="wallet-manager">
      <div className="wallet-manager-header">
        <h2>
          <Key className="header-icon" />
          Wallet Manager
        </h2>
        <p>Manage your imported wallets for Nillion networks</p>
      </div>

      {error && (
        <div className={`error-message ${error.includes('successfully') ? 'success' : ''}`}>
          <Shield className="error-icon" />
          {error}
        </div>
      )}

      <div className="wallet-actions">
        <ReusableButton 
          variant="primary"
          onClick={() => setShowImportModal(true)}
        >
          <Plus className="icon" />
          Import Wallet
        </ReusableButton>
      </div>

      {/* Network Filter */}
      {storedWallets.length > 0 && (
        <div className="network-filter">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedNetworkFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedNetworkFilter('all')}
            >
              All Networks
            </button>
            <button 
              className={`filter-btn ${selectedNetworkFilter === 'testnet' ? 'active' : ''}`}
              onClick={() => setSelectedNetworkFilter('testnet')}
            >
              Testnet
            </button>
            <button 
              className={`filter-btn ${selectedNetworkFilter === 'mainnet' ? 'active' : ''}`}
              onClick={() => setSelectedNetworkFilter('mainnet')}
            >
              Mainnet
            </button>
          </div>
        </div>
      )}

      <div className="wallets-list">
        {filteredWallets.length === 0 ? (
          <div className="empty-state">
            <Key className="empty-icon" />
            <h3>
              {selectedNetworkFilter === 'all' 
                ? 'No wallets imported' 
                : `No ${selectedNetworkFilter} wallets`}
            </h3>
            <p>
              {selectedNetworkFilter === 'all' 
                ? 'Import your first wallet to get started with Nillion networks'
                : `No wallets found for ${getNetworkDisplayName(selectedNetworkFilter as NillionNetwork)}`}
            </p>
          </div>
        ) : (
          filteredWallets.map((wallet) => (
            <div 
              key={wallet.id} 
              className={`wallet-card ${activeWalletId === wallet.id ? 'active' : ''}`}
            >
              <div className="wallet-info">
                <div className="wallet-header">
                  <h3>{wallet.name}</h3>
                  <div className="wallet-badges">
                    <span className="network-badge">
                      <Network className="badge-icon" />
                      {getNetworkDisplayName(wallet.network)}
                    </span>
                    {activeWalletId === wallet.id && (
                      <span className="active-badge">Active</span>
                    )}
                  </div>
                </div>
                <div className="wallet-did-container">
                  <p className="wallet-address">{formatDid(wallet.did)}</p>
                  <button 
                    className="copy-did-btn"
                    onClick={() => handleCopyDid(wallet.did)}
                    title="Copy full DID"
                  >
                    {copiedDid === wallet.did ? (
                      <Check className="copy-icon" />
                    ) : (
                      <Copy className="copy-icon" />
                    )}
                  </button>
                </div>
                <p className="wallet-meta">
                  Created: {new Date(wallet.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="wallet-actions">
                <ReusableButton 
                  variant="primary"
                  onClick={() => handleOpenPDM(wallet)}
                >
                  <Database className="icon" />
                  PDM
                </ReusableButton>
                <ReusableButton 
                  variant="secondary"
                  onClick={handleImportNewWallet}
                >
                  <Plus className="icon" />
                  Import New
                </ReusableButton>
                <ReusableButton 
                  variant="secondary"
                  onClick={() => handleRemoveWallet(wallet.id)}
                >
                  <Trash2 className="icon" />
                </ReusableButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import Wallet Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content import-modal">
            <h3>
              <Download className="icon" />
              Import Wallet
            </h3>
            <p>Import an existing wallet using your private key</p>
            
            <div className="form-group">
              <label htmlFor="walletName">Wallet Name (Optional)</label>
              <input
                id="walletName"
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="My Nillion Wallet"
                className="form-input"
              />
            </div>


            <div className="form-group">
              <label htmlFor="privateKey">Private Key</label>
              <textarea
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key (0x... or hex string)"
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Encryption Password</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to encrypt your private key"
                  className="form-input"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="form-input"
              />
            </div>

            {isImporting && (
              <div className="import-progress">
                <div className="progress-spinner"></div>
                <p>Importing wallet and creating addresses for both networks...</p>
              </div>
            )}

            <div className="modal-actions">
              <ReusableButton 
                variant="secondary"
                onClick={() => {
                  setShowImportModal(false);
                  setPrivateKey('');
                  setPassword('');
                  setConfirmPassword('');
                  setWalletName('');
                  setError('');
                }}
                disabled={isImporting}
              >
                Cancel
              </ReusableButton>
              <ReusableButton 
                variant="primary"
                onClick={handleImportWallet}
                isLoading={isImporting}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import Wallet'}
              </ReusableButton>
            </div>
          </div>
        </div>
      )}

      {onClose && (
        <div className="wallet-manager-footer">
          <ReusableButton variant="secondary" onClick={onClose}>
            Close
          </ReusableButton>
        </div>
      )}
    </div>
  );
}
