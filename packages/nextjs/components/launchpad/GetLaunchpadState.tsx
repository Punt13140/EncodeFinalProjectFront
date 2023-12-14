import { useState } from "react";
import * as launchpadJson from "../assets/Launchpad.json";
import { Abi, formatUnits, parseEther } from "viem";
import { useAccount, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";

export const GetLaunchpadState = (params: { contract_address: `0x${string}` }) => {
  const launchpadContract = {
    address: params.contract_address,
    abi: launchpadJson.abi as Abi,
  };

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...launchpadContract,
        functionName: "saleStart",
      },
      {
        ...launchpadContract,
        functionName: "saleEnd",
      },
      {
        ...launchpadContract,
        functionName: "totalAmount",
      },
      {
        ...launchpadContract,
        functionName: "ratio",
      },
      {
        ...launchpadContract,
        functionName: "vestingStart",
      },
      {
        ...launchpadContract,
        functionName: "vestingEnd",
      },
    ],
  });

  if (isLoading)
    return (
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Loading...</h2>
          <span className="loading loading-ring loading-xs"></span>
        </div>
      </div>
    );

  if (
    isError ||
    !data ||
    data![0].status === "failure" ||
    data![1].status === "failure" ||
    data![2].status === "failure" ||
    data![3].status === "failure" ||
    data![4].status === "failure" ||
    data![5].status === "failure"
  )
    return (
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Error!</h2>
          <p>Error loading information on the launchpad! Try reloading the page...</p>
        </div>
      </div>
    );

  console.log(data);

  return (
    <HandleState
      saleStart={data![0].result as bigint}
      saleEnd={data![1].result as bigint}
      totalAmount={data![2].result as bigint}
      ratio={data![3].result as bigint}
      vestingStart={data![4].result as bigint}
      vestingEnd={data![5].result as bigint}
      contract_address={params.contract_address}
    />
  );
};

const HandleState = (params: {
  saleStart: bigint;
  saleEnd: bigint;
  totalAmount: bigint;
  ratio: bigint;
  vestingStart: bigint;
  vestingEnd: bigint;
  contract_address: `0x${string}`;
}) => {
  const saleStartTimeDate = new Date(Number(params.saleStart) * 1000);
  const saleEndTimeDate = new Date(Number(params.saleEnd) * 1000);
  const vestingStartTimeDate = new Date(Number(params.vestingStart) * 1000);
  const vestingEndTimeDate = new Date(Number(params.vestingEnd) * 1000);

  if (saleStartTimeDate > new Date()) return <SaleNotStarted saleStartTimeDate={saleStartTimeDate} />;
  if (saleEndTimeDate < new Date())
    return (
      <SaleEnded
        saleEndTimeDate={saleEndTimeDate}
        vestingStartTimeDate={vestingStartTimeDate}
        vestingEndTimeDate={vestingEndTimeDate}
        contract_address={params.contract_address}
      />
    );
  return <SaleLive totalAmount={params.totalAmount} ratio={params.ratio} contract_address={params.contract_address} />;
};

const SaleLive = (params: { totalAmount: bigint; ratio: bigint; contract_address: `0x${string}` }) => {
  return (
    <div className="card w-96 bg-base-300 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Sale Live!!!</h2>
        <p>You can buy {formatUnits(params.totalAmount, 18)} Tokens.</p>
        <p>Ratio: {params.ratio.toString()}</p>
        <Buy ratio={params.ratio} contract_address={params.contract_address} />
      </div>
    </div>
  );
};

const Buy = (params: { ratio: bigint; contract_address: `0x${string}` }) => {
  const { address } = useAccount();

  const [desiredTokens, setDesiredTokens] = useState<number>(3);
  const ratio = Number(params.ratio);

  const { config, error } = usePrepareContractWrite({
    address: params.contract_address,
    abi: launchpadJson.abi as Abi,
    functionName: "buy",
    value: parseEther((desiredTokens / ratio).toString()),
  });
  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (!address) return <p>You are not connected</p>;

  if (error) {
    console.log(error.message);
  }

  return (
    <>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        value={desiredTokens}
        onChange={e => setDesiredTokens(parseInt(e.target.value.replace(/\D/, "")) || 0)}
      />

      <p>Price: {desiredTokens / ratio}</p>

      <div className="card-actions justify-end">
        <button
          className="btn"
          disabled={!write || isLoading}
          onClick={() => write?.()}
          // onClick={() => write?.({ value: parseEther((desiredTokens / params.ratio).toString()) })}
        >
          {isLoading ? "Loading..." : "Buy"}
        </button>
      </div>

      {isSuccess && (
        <div>
          Success!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`} target="_blank" rel="noreferrer">
              Etherscan
            </a>
          </div>
        </div>
      )}
    </>
  );
};

const SaleEnded = (params: {
  saleEndTimeDate: Date;
  vestingStartTimeDate: Date;
  vestingEndTimeDate: Date;
  contract_address: `0x${string}`;
}) => {
  return (
    <>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Sale ended</h2>
          <p>Sale ended on {params.saleEndTimeDate.toLocaleString()}</p>
        </div>
      </div>
      {/* todo Vesting information component */}
      {/* todo Claim condition ? */}
      <Claim contract_address={params.contract_address} />
    </>
  );
};

const Claim = (params: { contract_address: `0x${string}` }) => {
  const { config } = usePrepareContractWrite({
    address: params.contract_address,
    abi: launchpadJson.abi as Abi,
    functionName: "claim",
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Card title!</h2>
        <p>If a dog chews shoes whose shoes does he choose?</p>
        <div className="card-actions justify-end">
          <button className="btn" disabled={!write || isLoading} onClick={() => write?.()}>
            {isLoading ? "Loading..." : "Claim"}
          </button>
        </div>
        {isSuccess && (
          <div>
            Success!
            <div>
              <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SaleNotStarted = (params: { saleStartTimeDate: Date }) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Sale not started</h2>
        <p>Sale will start on {params.saleStartTimeDate.toLocaleString()}</p>
      </div>
    </div>
  );
};
