import { Signer } from "ethers";
export declare const dumpHash: (uniqueId: string, hash: string, sig1: string, sig2: string, network: string | undefined, signer: Signer | undefined) => Promise<string>;
