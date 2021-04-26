import { Signer } from "ethers";
export declare const register: (devicePubKey: string, userPubKey: string, network: string | undefined, signer: Signer | undefined) => Promise<string>;
