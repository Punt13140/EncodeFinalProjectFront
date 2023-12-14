import { useRouter } from "next/router";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { CheckWalletConnected } from "~~/components/launchpad/CheckWalletConnected";

const Launchpad: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const contract_address = address as `0x${string}`;

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center ">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Encode Final Project - Team 7</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <CheckWalletConnected contract_address={contract_address} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Launchpad;
