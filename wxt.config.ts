import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Nilz - Welcome to Web3',
    description: 'Chrome extension with Privy authentication and wallet management',
    permissions: ['identity', 'storage'],
    host_permissions: ['https://auth.privy.io/*'],
    options_page: 'options.html',
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; frame-ancestors 'none';"
    }
  }
});
