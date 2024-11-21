"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/loader/Spinner";
import MintModal from "@/components/modal/mint-modal";
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
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction
} from "@solana/web3.js";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  symbol: z.string().min(2, {
    message: "Sumbol must be at least 2 characters.",
  }),
  supply: z
    .string()
    .transform((val) => parseInt(val, 10)) // Convert string to number
    .pipe(
      z
        .number()
        .int()
        .nonnegative()
        .refine((val) => val > 0, {
          message: "Supply must be greater than 0.",
        })
    ),
  decimals: z
    .string()
    .length(1, {
      message: "Decimals must be a single digit.",
    })
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .nonnegative()
        .refine((val) => val > 0, {
          message: "Cannot set to 0.",
        })
    ),
  description: z.string().min(2, {
    message: "Description must be at least 3 characters.",
  }),
  image: z.string().optional(),
});

type CustomFormSchema = Omit<
  z.infer<typeof formSchema>,
  "supply" | "decimals"
> & {
  supply: string;
  decimals: string;
};

const CreateToken = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<any>();

  const form = useForm<CustomFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      supply: "100",
      decimals: "9",
      description: "",
    },
  });

  async function onSubmit(values: CustomFormSchema) {
    setLoading(true);
    const mintKeypair = new Keypair();
    const metadata = {
      mint: mintKeypair.publicKey,
      name: values?.name,
      symbol: values?.symbol,
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
        }),

        // initialize metadata pointer
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),

        // actaully created mint account
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          Number(values?.decimals),
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),

        // actual metadata is added to the minted token
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );
      try {
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        transaction.partialSign(mintKeypair);
        await wallet.sendTransaction(transaction, connection);
        setTokenAddress(JSON.stringify(mintKeypair.publicKey));
        setLoading(false);
        setIsModalOpen(true);
      } catch (error) {
        console.log(error, "mint account error");
        setLoading(false);
      }
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
                    <Input
                      placeholder="Put the symbol of your Token."
                      {...field}
                    />
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
                    <Input type="number" placeholder="9" {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of decimals in your token
                  </FormDescription>
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
                    <Input type="number" placeholder="1000" {...field} />
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
                    <Input
                      placeholder="Put the description of your Token."
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="bg-green-500 text-white"
            disabled={!wallet?.publicKey ? true : false}
          >
            Create Token{" "}
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </Button>
        </form>
      </Form>
      <>
        {isModalOpen && (
          <MintModal
            setIsModalOpen={setIsModalOpen}
            tokenAddress={tokenAddress}
          />
        )}
      </>
    </div>
  );
};

export default CreateToken;
