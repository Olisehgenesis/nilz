import { PrivyProvider, usePrivy, useLogin, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import './App.css';

// You'll need to replace this with your actual Privy App ID
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || 'YOUR_PRIVY_APP_ID_HERE';

const WelcomeContent = () => {
  const { authenticated, ready, user } = usePrivy();
  const { login } = useLogin();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);

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

  if (authenticated && user) {
    return (
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>🎉 Welcome to Nilz!</h1>
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
              <h3>Your Wallet</h3>
              <p><strong>Address:</strong> {wallets[0].address}</p>
              <p><strong>Type:</strong> {wallets[0].walletClientType}</p>
            </div>
          )}
        </div>
        
        <button 
          className="logout-btn"
          onClick={() => window.location.reload()}
        >
          Start Fresh
        </button>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Welcome to Nilz</h1>
        <p>Your gateway to Web3</p>
      </div>
      
      <div className="auth-options">
        <div className="auth-card">
          <h3>🚀 Create Wallet</h3>
          <p>Get started with a new wallet and explore Web3</p>
          <button 
            className="primary-btn"
            onClick={handleCreateWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </button>
        </div>
        
        <div className="auth-card">
          <h3>🔑 Login with Wallet</h3>
          <p>Connect your existing wallet to continue</p>
          <button 
            className="secondary-btn"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Login'}
          </button>
        </div>
      </div>
      
      <div className="features">
        <h3>What you can do with Nilz:</h3>
        <ul>
          <li>✨ Secure wallet management</li>
          <li>🔐 Easy authentication</li>
          <li>🌐 Web3 integration</li>
          <li>📱 Chrome extension convenience</li>
        </ul>
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
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png'
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
      <WelcomeContent />
    </PrivyProvider>
  );
}

export default App;
