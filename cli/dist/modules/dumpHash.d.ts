import { Signer } from "ethers";
export declare const dumpHash: (uniqueId: string, hash: string, chipSig: string, userSig: string, network: string | undefined, signer: Signer | undefined) => Promise<string>;
