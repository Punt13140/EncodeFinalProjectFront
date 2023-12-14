import { useState } from "react";
import Link from "next/link";
import launchpadJson from "../assets/LaunchpadFactory.json";
import { ethers } from "ethers";
import { Abi, parseEther, parseUnits } from "viem";
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const LaunchpadFactory = () => {
  const [totalAmount, setTotalAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [launchpadOwner, setLaunchpadOwner] = useState("");
  const [saleStart, setSaleStart] = useState("");
  const [saleEnd, setSaleEnd] = useState("");
  const [vestingStart, setVestingStart] = useState("");
  const [vestingEnd, setVestingEnd] = useState("");
  const [ratio, setRatio] = useState("");
  const [lastCreatedLaunchpad, setLastCreatedLaunchpad] = useState("");

  const { address, isConnecting } = useAccount();

  const { config, error, isError } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: launchpadJson.abi as Abi,
    functionName: "createLaunchpad",
    value: parseEther("0.01"),
    args: [
      launchpadOwner,
      tokenAddress,
      parseUnits(totalAmount, 18),
      saleStart,
      saleEnd,
      vestingStart,
      vestingEnd,
      parseUnits(ratio, 18),
    ],
  });

  const { data, write, isLoading, isSuccess } = useContractWrite(config);

  const waitForTransaction = useWaitForTransaction({
    hash: data?.hash,
    onSettled(data) {
      const iface = new ethers.utils.Interface(launchpadJson.abi);
      const parsedLogs = data ? iface.parseLog(data.logs[0]) : null;
      if (parsedLogs != null) {
        setLastCreatedLaunchpad(parsedLogs.args.launchpad);
      }
    },
  });

  if (!address)
    return (
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <p>{isConnecting ? "Connecting to your wallet..." : "Please connect to your wallet"}</p>
        </div>
      </div>
    );

  if (isError) {
    console.log(error?.message);
  }

  return (
    <div className="card lg:card-side bg-base-300 shadow-xl mb-4">
      <div className="card-body">
        <h2 className="card-title">Create Launchpad {}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            write?.();
          }}
        >
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Launchpad Owner:</span>
            </label>
            <input
              type="text"
              placeholder="Launchpad Owner"
              className="input input-bordered w-full max-w-s"
              value={launchpadOwner}
              onChange={e => setLaunchpadOwner(e.target.value)}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Token Address:</span>
            </label>
            <input
              type="text"
              placeholder="Token Address"
              className="input input-bordered w-full max-w-s"
              value={tokenAddress}
              onChange={e => setTokenAddress(e.target.value)}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Total Amount:</span>
            </label>
            <input
              type="text"
              placeholder="Total Amount"
              className="input input-bordered w-full max-w-s"
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Ratio:</span>
            </label>
            <input
              type="text"
              placeholder="Ratio"
              className="input input-bordered w-full max-w-s"
              value={ratio}
              onChange={e => setRatio(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Sale Start:</span>
            </label>
            <input
              type="text"
              placeholder="Sale Start Timestamp"
              className="input input-bordered w-full max-w-s"
              value={saleStart}
              onChange={e => setSaleStart(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Sale End:</span>
            </label>
            <input
              type="text"
              placeholder="Sale End Timestamp"
              className="input input-bordered w-full max-w-s"
              value={saleEnd}
              onChange={e => setSaleEnd(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Vesting Start:</span>
            </label>
            <input
              type="text"
              placeholder="Vesting Start Timestamp"
              className="input input-bordered w-full max-w-s"
              value={vestingStart}
              onChange={e => setVestingStart(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="form-control w-full max-w-s my-4 mt-0">
            <label className="label">
              <span className="label-text">Vesting End:</span>
            </label>
            <input
              type="text"
              placeholder="Vesting End Timestamp"
              className="input input-bordered w-full max-w-s"
              value={vestingEnd}
              onChange={e => setVestingEnd(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <button className="btn btn-active btn-neutral" disabled={!write || isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
          {isError && <p>Invalid parameters, check console for more information</p>}
          {isSuccess && (
            <div>
              <p>Submitted transaction:</p>
              <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`} target="_blank" rel="noreferrer">
                Etherscan
              </a>
            </div>
          )}
          {waitForTransaction.isSuccess && (
            <p>
              <Link href={`/launchpad/${lastCreatedLaunchpad}`} target="_blank">
                Go to Launchpad
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
