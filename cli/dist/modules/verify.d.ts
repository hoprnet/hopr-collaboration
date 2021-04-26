import { Signer } from "ethers";
export declare const verify: (uniqueId: string, isfirstblock: boolean, prevhash: string, data: string, network: string | undefined, signer: Signer | undefined) => Promise<boolean>;
