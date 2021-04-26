import { Contract, ethers } from "ethers";
export declare const BLOCK_CONFIRMATION = 3;
export declare const SUPPORTED_NETWORK: {
    [key: string]: string;
};
export declare const DEVICE_TYPEHASH: string;
export declare const DATA_TYPEHASH: string;
export declare const provider: (network: string, etherscanKey?: string | undefined, infuraKey?: string | undefined) => ethers.providers.BaseProvider;
export declare const explorerTx: (provider: ethers.providers.BaseProvider, txHash: string) => string;
export declare const explorerBlock: (provider: ethers.providers.BaseProvider, blockNumber: number) => string;
export declare const contract: (provider: ethers.providers.BaseProvider) => Contract;
export declare function getUniqueDeviceId(contract: Contract, device: {
    chip: string;
    user: string;
}): Promise<string>;
export declare function getData(contract: Contract, data: {
    isFirstBlock: boolean;
    previousHash: string;
    data: string;
}): Promise<string>;
