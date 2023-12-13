import { GetLaunchpadState } from "./GetLaunchpadState";
import { useAccount } from "wagmi";

export const CheckWalletConnected = () => {
  const { address, isConnecting } = useAccount();

  if (address) return <GetLaunchpadState />;

  const message = isConnecting ? "Connecting to your wallet..." : "Please connect to your wallet";

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <p>{message}</p>
      </div>
    </div>
  );
};
