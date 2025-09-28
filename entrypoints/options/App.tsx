import { PrivyProvider, usePrivy, useLogin } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { Shield, CheckCircle, Lock } from 'lucide-react';
import './App.css';

// You'll need to replace this with your actual Privy App ID

const PRIVY_APP_ID = 'cmg0bxv0t00ghl70c74n206ko';

const AuthContent = () => {
  const { authenticated, ready } = usePrivy();
  const { login } = useLogin({
    onComplete: () => {
      // Close the options page and return to the extension popup
      window.close();
    }
  });

  // Auto-trigger login when opened for authentication
  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [authenticated, ready, login]);

  if (!ready) {
    return (
      <div className="auth-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Initializing secure authentication...</p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="auth-container">
        <div className="success">
          <h2>
            <CheckCircle className="icon" />
            Authentication Successful!
          </h2>
          <p>Your private data dashboard is now ready. You can securely manage your DID, keypair, and app permissions.</p>
          <button onClick={() => window.close()} className="close-btn">
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h2>
          <Lock className="icon" />
          Authenticate with Nilz
        </h2>
        <p>Please complete the authentication process to access your private data dashboard and manage app permissions securely.</p>
        <div className="loading">
          <div className="spinner"></div>
          <p>Opening secure authentication...</p>
        </div>
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
      <AuthContent />
    </PrivyProvider>
  );
}

export default App;
