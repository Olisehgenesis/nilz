import { PrivyProvider, usePrivy, useLogin } from '@privy-io/react-auth';
import { useEffect } from 'react';
import './App.css';

// You'll need to replace this with your actual Privy App ID
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || 'YOUR_PRIVY_APP_ID_HERE';

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
          <p>Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="auth-container">
        <div className="success">
          <h2>✅ Authentication Successful!</h2>
          <p>You can now close this window and return to the extension.</p>
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
        <h2>🔐 Authenticate with Nilz</h2>
        <p>Please complete the authentication process to continue.</p>
        <div className="loading">
          <div className="spinner"></div>
          <p>Opening authentication...</p>
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
      <AuthContent />
    </PrivyProvider>
  );
}

export default App;
