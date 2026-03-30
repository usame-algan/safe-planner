/// <reference types="vite/client" />

import type { Eip1193Provider } from '@safe-global/protocol-kit';

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

// biome-ignore lint/correctness/noUnusedVariables: ambient Vite typing declarations are consumed by TypeScript
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
