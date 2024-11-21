"use client";

import React, { ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="m-5 flex gap-8 mt-5 items-center">
              <WalletMultiButton />
              <Link href={"/create-token"} className="bg-white">
                Create Token
              </Link>
            </div>
            <div className="m-5">{children}</div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default WalletContextProvider;
