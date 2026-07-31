import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { localhost, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Digital Credential Network',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [localhost, sepolia],
  ssr: false,
});
