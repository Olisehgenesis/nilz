import { PrivyProvider, usePrivy, useLogin, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { ReusableButton } from './components/ReusableButton';
import { WalletManager } from './components/WalletManager';
import { HackathonLanding } from './HackathonLanding';
import { Shield, Key, Download, Wallet, Settings } from 'lucide-react';
import { ImportedWallet, getStoredWallets } from './utils/walletStorage';
import './App.css';

// You'll need to replace this with your actual Privy App ID
const PRIVY_APP_ID = 'cmg0bxv0t00ghl70c74n206ko';

const WelcomeContent = () => {
  const { authenticated, ready, user } = usePrivy();
  const { login } = useLogin();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showHackathon, setShowHackathon] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [activeImportedWallet, setActiveImportedWallet] = useState<ImportedWallet | null>(null);

  // Load user data and wallets from Chrome storage
  useEffect(() => {
    const loadStoredData = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Load user data
        chrome.storage.local.get(['userData'], (result) => {
          if (result.userData) {
            setUserData(result.userData);
          }
        });

        // Load stored wallets and set active wallet
        try {
          const walletData = await getStoredWallets();
          if (walletData.activeWalletId) {
            const activeWallet = walletData.importedWallets.find(
              wallet => wallet.id === walletData.activeWalletId
            );
            if (activeWallet) {
              setActiveImportedWallet(activeWallet);
            }
          }
        } catch (error) {
          console.error('Failed to load stored wallets:', error);
        }
      }
    };

    loadStoredData();
  }, []);

  // Save user data to Chrome storage when authenticated
  useEffect(() => {
    if (authenticated && user && typeof chrome !== 'undefined' && chrome.storage) {
      const dataToStore = {
        id: user.id,
        email: user.email?.address,
        phone: user.phone?.number,
        wallets: wallets.map(w => ({ address: w.address, type: w.walletClientType })),
        timestamp: Date.now()
      };
      chrome.storage.local.set({ userData: dataToStore });
      setUserData(dataToStore);
    }
  }, [authenticated, user, wallets]);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      // For Chrome extensions, open options page for social login
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({
          url: chrome.runtime.getURL('options.html')
        });
      } else {
        await login();
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // For Chrome extensions, open options page for social login
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({
          url: chrome.runtime.getURL('options.html')
        });
      } else {
        await login();
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = () => {
    setShowWalletManager(true);
  };

  const handleWalletSelect = (wallet: ImportedWallet) => {
    setActiveImportedWallet(wallet);
    setShowWalletManager(false);
  };

  if (!ready) {
    return (
      <div className="welcome-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (showHackathon) {
    return <HackathonLanding onBack={() => setShowHackathon(false)} />;
  }

  if (showWalletManager) {
    return <WalletManager onWalletSelect={handleWalletSelect} onClose={() => setShowWalletManager(false)} />;
  }

  if (authenticated && user) {
    return (
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>
            <Shield className="header-icon" />
            Welcome to Nilz!
          </h1>
          <p>You're successfully authenticated</p>
        </div>
        
        <div className="user-info">
          <div className="user-card">
            <h3>User Information</h3>
            <p><strong>ID:</strong> {user.id}</p>
            {user.email && <p><strong>Email:</strong> {user.email.address}</p>}
            {user.phone && <p><strong>Phone:</strong> {user.phone.number}</p>}
          </div>
          
          {wallets.length > 0 && (
            <div className="wallet-card">
              <h3>Privy Wallet</h3>
              <p><strong>Address:</strong> {wallets[0].address}</p>
              <p><strong>Type:</strong> {wallets[0].walletClientType}</p>
            </div>
          )}

          {activeImportedWallet && (
            <div className="wallet-card imported-wallet">
              <h3>Imported Wallet</h3>
              <p><strong>Name:</strong> {activeImportedWallet.name}</p>
              <p><strong>DID:</strong> {activeImportedWallet.did}</p>
              <p><strong>Network:</strong> {activeImportedWallet.network === 'testnet' ? 'Nillion Testnet' : 'Nillion Mainnet'}</p>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <ReusableButton 
            variant="primary"
            fullWidth
            onClick={() => setShowHackathon(true)}
          >
            View Hackathons
          </ReusableButton>
          <ReusableButton 
            variant="secondary"
            fullWidth
            onClick={() => setShowWalletManager(true)}
          >
            <Wallet className="icon" />
            Manage Wallets
          </ReusableButton>
          <ReusableButton 
            variant="secondary"
            fullWidth
            onClick={() => window.location.reload()}
          >
            Start Fresh
          </ReusableButton>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>
          <Key className="header-icon" />
          Welcome to Nilz
        </h1>
        <p>Privacy-preserving storage for everyday people</p>
      </div>
      
      <div className="signin-card">
        <h3>
          <Shield className="icon" />
          Sign In to Continue
        </h3>
        <p>Access your private data dashboard and manage app permissions securely</p>
        <ReusableButton 
          variant="primary"
          fullWidth
          onClick={handleLogin}
          isLoading={isLoading}
        >
          Sign In
        </ReusableButton>
        
        <button 
          className="import-wallet-btn"
          onClick={handleImportWallet}
        >
          <Download className="icon" />
          Import Wallet
        </button>
      </div>

    </div>
  );
};

function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#84cc16',
          logo: 'https://your-logo-url.com/logo.png'
        },
        loginMethods: ['email', 'google', 'twitter', 'wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off'
          }
        }
      }}
    >
      <WelcomeContent />
    </PrivyProvider>
  );
}

export default App;
