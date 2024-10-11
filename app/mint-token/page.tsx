"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  createMint,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  symbol: z.string().min(2, {
    message: "Sumbol must be at least 2 characters.",
  }),
  supply: z.number().min(2, {
    message: "Supply must be at least 1 characters.",
  }),
  decimals: z.number().min(2, {
    message: "Decimals must be at least 1 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 3 characters.",
  }),
  image: z.string().optional(),
});

const MintToken = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  console.log(wallet?.publicKey, "wallet");
  console.log(connection, "connection");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      supply: 1000,
      decimals: 9,
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const mintKeypair = new Keypair();
    const metadata = {
      mint: mintKeypair.publicKey,
      name: "DODGE",
      symbol: "DOD    ",
      uri: "https://cdn.100xdevs.com/metadata.json",
      additionalMetadata: [],
    };
    if (wallet?.publicKey) {
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet?.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          lamports,
          space: mintLen,
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeypair);
      const res = await wallet.sendTransaction(transaction, connection);
      console.log(res, "res");
    }
  }
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex gap-10">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="This is your public display name of Token."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="Put the symbol of your Token." {...field} />
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-10">
            <FormField
              control={form.control}
              name="decimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decimals</FormLabel>
                  <FormControl>
                    <Input placeholder="9" {...field} />
                  </FormControl>
                  <FormDescription>Number of decimals in your token</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supply</FormLabel>
                  <FormControl>
                    <Input placeholder="1000" {...field} />
                  </FormControl>
                  <FormDescription>Max supply of your token</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-10">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is a logo of the token.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Put the description of your Token." {...field} />
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default MintToken;
