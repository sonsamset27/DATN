import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { config } from '../lib/wagmi';
import { queryClient } from '../lib/queryClient';
import { useTheme } from '../hooks/useTheme';
import { Toaster } from 'react-hot-toast';
import '@rainbow-me/rainbowkit/styles.css';

export function Providers({ children }) {
  const { isDark } = useTheme();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={isDark ? darkTheme() : lightTheme()}
          modalSize="compact"
        >
          {children}
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
