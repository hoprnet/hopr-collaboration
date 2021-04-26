import { Signer } from "ethers";
export declare const verifyData: (uniqueId: string, isfirstblock: boolean, prevhash: string, datapath: string, network: string | undefined, signer: Signer | undefined) => Promise<void>;
