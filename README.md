# Nilz - Private Data Manager

A browser extension for Nillion's Private Storage that gives non-developers full control over their User Owned Collections. This extension provides a user-facing interface that manages DIDs, keypairs, and private data with comprehensive access control.

## Features

### 🔐 Secure Wallet Management
- Import existing wallets using private keys
- Secure encryption of private keys with user passwords
- Support for both Nillion Testnet and Mainnet
- DID generation and management
- Multi-wallet support with network filtering

### 📊 Private Data Management
- **Create Collections**: Standard and Owned collection types
- **Store Private Data**: Encrypted and plaintext data storage
- **CRUD Operations**: Create, read, update, and delete data records
- **Data Organization**: Categorize and tag your private data

### 🔑 Access Control & Permissions
- **Grant Access**: Share data with specific users via DID
- **Revoke Access**: Remove permissions at any time
- **Permission Types**: Read, Write, and Execute permissions
- **Audit Trail**: Track all permission changes

### 🎯 User-Friendly Interface
- **Tabbed Interface**: Separate views for Data, Collections, and Permissions
- **Real-time Updates**: Instant feedback on all operations
- **Error Handling**: Comprehensive error messages and recovery
- **Responsive Design**: Works on all screen sizes

## Prerequisites

Before using the extension, you need:

1. **Nillion Wallet**: Create a wallet at [Nillion Wallet](https://docs.nillion.com/community/guides/nillion-wallet)
2. **Testnet NIL**: Get NIL tokens from the [Nillion Faucet](https://docs.nillion.com/community/guides/testnet-faucet)
3. **Nillion API Key**: Get an API key with nilDB subscription from [Nillion API Access](https://docs.nillion.com/build/network-api-access)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the extension:
   ```bash
   pnpm build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Usage

### Initial Setup

1. **Import Wallet**: 
   - Click "Import Wallet" in the Wallet Manager
   - Enter your private key and a password for encryption
   - The extension will create wallets for both testnet and mainnet

2. **Initialize SecretVaults**:
   - Click "PDM" on any wallet to open the Private Data Manager
   - Enter your Nillion API Key and wallet password
   - The extension will initialize the SecretVaults clients

### Managing Collections

1. **Create Collection**:
   - Click "New Collection" in the PDM
   - Choose between Standard or Owned collection types
   - Standard collections are managed by the builder client
   - Owned collections give you full control over access

2. **View Collections**:
   - Switch to the "Collections" tab
   - See all your collections with their types and creation dates
   - Click "Add Data" to create records in a specific collection

### Storing Private Data

1. **Create Data**:
   - Click "Create Private Data"
   - Select a collection from the dropdown
   - Enter a name and value for your data
   - Choose whether to encrypt the data (recommended)
   - Click "Create Data" to store it

2. **View Data**:
   - Switch to the "Private Data" tab
   - See all your stored data with encryption status
   - View permissions and creation dates
   - Use action buttons to manage each data entry

### Managing Access Permissions

1. **Grant Access**:
   - Click "Grant Access" on any owned data
   - Enter the recipient's DID
   - Select permission types (Read, Write, Execute)
   - Click "Grant Access" to share the data

2. **View Permissions**:
   - Switch to the "Permissions" tab
   - See all access grants you've made
   - View grantee DIDs and permission details
   - Track when permissions were granted

## Technical Architecture

### SecretVaults Integration

The extension uses Nillion's SecretVaults SDK with two main client types:

- **SecretVaultBuilderClient**: Manages collections and standard data
- **SecretVaultUserClient**: Handles owned data and access control

### Data Flow

1. **Initialization**: API key → Builder/User clients → Authentication
2. **Collection Management**: Create → List → Select for data operations
3. **Data Operations**: Create → Store → Read → Update → Delete
4. **Access Control**: Grant → Track → Revoke permissions

### Security Features

- **Encrypted Storage**: Private keys encrypted with user passwords
- **Secure Communication**: All API calls use HTTPS
- **Access Control**: Granular permissions for data sharing
- **Audit Trail**: Complete history of permission changes

## API Reference

### Collection Schemas

The extension supports predefined schemas:

```typescript
// Personal Data Schema
{
  type: 'object',
  properties: {
    fieldName: { type: 'string' },
    fieldValue: { type: 'string' },
    category: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } }
  },
  required: ['fieldName', 'fieldValue']
}
```

### Data Encryption

Use the `%allot` marker to encrypt sensitive data:

```typescript
const encryptedData = {
  fieldName: 'Personal Email',
  fieldValue: { '%allot': 'user@example.com' },
  category: 'personal'
};
```

## Development

### Project Structure

```
entrypoints/
├── popup/
│   ├── components/
│   │   ├── PDM.tsx          # Main Private Data Manager
│   │   ├── WalletManager.tsx # Wallet management
│   │   └── ReusableButton.tsx
│   └── utils/
│       ├── secretVaults.ts   # SecretVaults SDK integration
│       ├── nillion.ts        # Nillion utilities
│       └── walletStorage.ts  # Wallet storage management
```

### Key Components

- **PDM.tsx**: Main interface for private data management
- **secretVaults.ts**: Complete SecretVaults SDK wrapper
- **walletStorage.ts**: Secure wallet storage and encryption

### Building

```bash
# Development
pnpm dev

# Production build
pnpm build

# Firefox build
pnpm build:firefox
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [Nillion Documentation](https://docs.nillion.com/)
- Open an issue in this repository
- Join the [Nillion Community](https://discord.gg/nillion)

## Roadmap

- [ ] Query system integration
- [ ] Advanced permission management
- [ ] Data export/import functionality
- [ ] Multi-language support
- [ ] Mobile app companion
- [ ] Integration with popular dApps