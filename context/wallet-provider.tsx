"use client";

import React, { ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="p-5">
              <WalletMultiButton />
            </div>
            <div className="p-5">{children}</div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default WalletContextProvider;
