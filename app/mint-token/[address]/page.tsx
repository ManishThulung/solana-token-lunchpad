"use client";

import Spinner from "@/components/loader/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const formSchema = z.object({
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  amount: z.string().min(1, {
    message: "Amount must be at least 1 token.",
  }),
});

const page = ({ params }: { params: { address: string } }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      amount: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values, "dsfas");
    try {
      setLoading(true);
      if (wallet.publicKey) {
        const mint = new PublicKey(params.address);

        const associatedToken = getAssociatedTokenAddressSync(
          mint,
          new PublicKey(values.address),
          false,
          TOKEN_2022_PROGRAM_ID
        );
        console.log(associatedToken.toBase58(), "associatedToken.toBase58()");
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedToken,
            new PublicKey(values.address),
            mint,
            TOKEN_2022_PROGRAM_ID
          )
        );
        const sig = await wallet.sendTransaction(transaction, connection);
        console.log(sig, "sigggggggggggggg ata");

        const mintTransaction = new Transaction().add(
          createMintToInstruction(
            mint,
            associatedToken,
            wallet.publicKey,
            Number(values.amount),
            [],
            TOKEN_2022_PROGRAM_ID
          )
        );

        const mintSig = await wallet.sendTransaction(
          mintTransaction,
          connection
        );
        console.log(mintSig, "MINTSIGGGGGGGGGGGGGGG");
      }
      toast.success(`Token successfully minted to ${values.address}`);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      toast.error("Something went wrong!");
    }
  }

  return (
    <div className="my-20 mx-10">
      <h2 className="text-3xl font-bold text-center mb-8">Mint a token</h2>
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full flex justify-center flex-col"
          >
            <div className="flex gap-10 justify-center mb-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="w-[40%]">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        className="p-5"
                        placeholder="Mint address."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-[40%]">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        className="p-5"
                        placeholder="Amount of token to mint."
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
              className="bg-green-500 text-white m-auto px-7 py-5 hover:bg-green-400 font-semibold text-lg"
              disabled={!params.address ? true : false}
            >
              Mint Token{" "}
              {loading && (
                <div className="ml-2">
                  <Spinner />
                </div>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default page;
