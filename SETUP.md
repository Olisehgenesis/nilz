# Nilz - Welcome to Web3 Chrome Extension

A beautiful Chrome extension that provides wallet creation and authentication using Privy's React SDK.

## Features

- 🚀 **Create Wallet** - Get started with a new wallet and explore Web3
- 🔑 **Login with Wallet** - Connect your existing wallet to continue
- ✨ **Secure wallet management** - Built with Privy's secure infrastructure
- 🔐 **Easy authentication** - Multiple login methods supported
- 🌐 **Web3 integration** - Ready for blockchain interactions
- 📱 **Chrome extension convenience** - Access your wallet from anywhere

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Privy

1. Go to [Privy Dashboard](https://dashboard.privy.io/apps)
2. Create a new app or select an existing one
3. Copy your App ID from the dashboard
4. Update the `PRIVY_APP_ID` in `entrypoints/popup/App.tsx`:

```typescript
const PRIVY_APP_ID = 'your_actual_privy_app_id_here';
```

### 3. Configure Chrome Extension Permissions

The extension is already configured with the necessary permissions in `wxt.config.ts`:

- `identity` - Required for OAuth flows
- `storage` - For persisting user sessions
- `https://auth.privy.io/*` - Host permission for Privy authentication

### 4. Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Create extension zip
pnpm zip
```

### 5. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` directory (after running `pnpm build`)

## Privy Dashboard Configuration

### Required Settings

1. **Allowed Origins**: Add your extension ID
   ```
   chrome-extension://<your-extension-id>
   ```

2. **Redirect URLs** (for social login):
   ```
   https://<your-extension-id>.chromiumapp.org/
   ```

3. **Login Methods**: Configure in your Privy app settings
   - Google
   - Apple
   - Email
   - SMS
   - Twitter
   - Wallet

## Security Features

- ✅ Strict Content Security Policy
- ✅ Minimal permissions requested
- ✅ Secure DOM manipulation
- ✅ Input validation
- ✅ Frame-ancestors protection

## Architecture

- **Framework**: WXT (Web Extension Toolkit) with React
- **Authentication**: Privy React SDK
- **Styling**: Modern CSS with glassmorphism effects
- **State Management**: Privy's built-in state management

## File Structure

```
entrypoints/
├── popup/
│   ├── App.tsx          # Main welcome page component
│   ├── App.css          # Modern styling
│   ├── main.tsx         # React entry point
│   └── index.html       # Popup HTML
├── background.ts         # Service worker
└── content.ts           # Content script
```

## Next Steps

1. Replace `YOUR_PRIVY_APP_ID_HERE` with your actual Privy App ID
2. Test the authentication flow
3. Customize the styling and branding
4. Add additional Web3 features as needed

## Support

For issues related to:
- **Privy**: Check [Privy Documentation](https://docs.privy.io/)
- **WXT**: Check [WXT Documentation](https://wxt.dev/)
- **Chrome Extensions**: Check [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
