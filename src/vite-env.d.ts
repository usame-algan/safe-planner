/// <reference types="vite/client" />

import { Eip1193Provider } from '@safe-global/protocol-kit';

declare global {
  interface Window {
    ethereum: Eip1193Provider;
  }
}

interface ImportMetaEnv {
  readonly VITE_INFURA_ID: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
