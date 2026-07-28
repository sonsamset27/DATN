import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { localhost, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Digital Credential Network',
  projectId: 'YOUR_PROJECT_ID', // Replaces with real WalletConnect ID if needed for production
  chains: [localhost, sepolia],
  ssr: false,
});
