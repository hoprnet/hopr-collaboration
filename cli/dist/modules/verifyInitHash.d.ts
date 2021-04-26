import { Signer } from "ethers";
export declare const verifyInitHash: (blocknumber: string, blockhash: string, network: string | undefined, signer: Signer | undefined) => Promise<boolean>;
