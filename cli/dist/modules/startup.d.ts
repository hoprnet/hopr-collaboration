import { Signer } from "ethers";
export declare const startup: (network: string | undefined, signer: Signer | undefined) => Promise<[string, string]>;
