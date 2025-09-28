import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Nilz - Private Data Manager',
    description: 'Browser extension for Nillion Private Storage with full control over User Owned Collections',
    permissions: ['identity', 'storage'],
    host_permissions: [
      'https://auth.privy.io/*',
      'https://nildb-stg-n1.nillion.network/*',
      'https://nildb-stg-n2.nillion.network/*',
      'https://nildb-stg-n3.nillion.network/*',
      'https://nildb-5ab1.nillion.network/*',
      'https://nildb-8001.cloudician.xyz/*',
      'https://nildb-f496.pairpointweb3.io/*',
      'https://nildb-f375.stcbahrain.net/*',
      'https://nildb-2140.staking.telekom-mms.com/*'
    ],
    options_page: 'options.html',
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; frame-ancestors 'none';"
    }
  }
});
