import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { type Config, createConfig, http, WagmiProvider } from 'wagmi';
import { APP_CHAINS } from '../helpers/networks.ts';

const transports = Object.fromEntries(
  APP_CHAINS.map((chain) => {
    const rpcUrl =
      chain.id === 1 && import.meta.env.VITE_INFURA_ID
        ? `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`
        : chain.id === 11155111 && import.meta.env.VITE_INFURA_ID
          ? `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`
          : chain.rpcUrls.default.http[0];

    return [chain.id, http(rpcUrl)];
  })
);

const config = createConfig(
  getDefaultConfig({
    chains: APP_CHAINS,
    transports,
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    appName: 'Safe Planner',
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: JSX.Element }) => {
  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
