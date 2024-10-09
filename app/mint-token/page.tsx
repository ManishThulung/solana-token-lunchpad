"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React from "react";

const page = () => {
  const  wallet  = useWallet();
  const {connection} = useConnection()
  console.log(wallet?.publicKey, "wallet");
  console.log(connection, "connection");
  return <div>
    
  </div>;
};

export default page;
