import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import { Button } from "../ui/button";

interface IProps {
  setIsModalOpen: any;
  tokenAddress: any;
}

const MintModal: FC<IProps> = ({ setIsModalOpen, tokenAddress }) => {
  const handleClose = () => {
    setIsModalOpen(false);
  };
  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-black text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-black px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex justify-center items-center">
                <Image
                  src={"/success-icon.png"}
                  alt="success png"
                  height={60}
                  width={60}
                />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-white text-center my-4">
                  Token successfully created
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    Tokne Address: {tokenAddress}
                  </p>
                  <Link
                    href={`https://explorer.solana.com/address/${tokenAddress}?cluster=devnet`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="mt-4 text-sm text-gray-300"
                  >
                    Check out the token detail from here
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-black px-4 py-3 sm:flex gap-4 sm:px-6 justify-center">
              <Link
                className={`bg-blue-600 hover:bg-blue-500 rounded flex justify-center items-center px-5 ${
                  !tokenAddress && "cursor-not-allowed"
                }`}
                href={`/mint-token/${JSON.parse(tokenAddress)}`}
              >
                <span className="font-semibold">Mint Token</span>
              </Link>
              <Button
                type="button"
                onClick={handleClose}
                variant={"destructive"}
                className="px-5"
              >
                <span className="font-semibold">Close</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintModal;
