import { GetLaunchpadState } from "./GetLaunchpadState";
import { useAccount } from "wagmi";

export const CheckWalletConnected = (params: { contract_address: `0x${string}` }) => {
  const { address, isConnecting } = useAccount();

  if (address) return <GetLaunchpadState contract_address={params.contract_address} />;

  const message = isConnecting ? "Connecting to your wallet..." : "Please connect to your wallet";

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <p>{message}</p>
      </div>
    </div>
  );
};
