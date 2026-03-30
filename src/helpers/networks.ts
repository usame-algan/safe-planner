import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const APP_CHAINS = [
  mainnet,
  sepolia,
  gnosis,
  polygon,
  arbitrum,
  optimism,
  base,
  avalanche,
  bsc,
] as const;

export const APP_CHAIN_IDS = APP_CHAINS.map((chain) => chain.id);
