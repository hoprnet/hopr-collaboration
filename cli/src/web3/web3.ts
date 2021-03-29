require('dotenv').config()
import { keccak256 } from "@ethersproject/keccak256";
import {Contract, ethers} from "ethers";
import { defaultAbiCoder, solidityPack, toUtf8Bytes } from "ethers/lib/utils";
import {ABI} from "./abi";

const NAME = 'Chain on a Chip';
const VERSION = '1';

export const BLOCK_CONFIRMATION = 3;

// supported network
export const SUPPORTED_NETWORK: {[key: string]: string} = {
    "kovan": "0x93639eb65c0e78262f9f92291e8d885039c9de0a"
};

export const DEVICE_TYPEHASH = keccak256(
    toUtf8Bytes('Device(address,address)')
);
export const DATA_TYPEHASH = keccak256(
  toUtf8Bytes('Data(bool,bytes32,string)')
);

// Specify your own API keys
// Each is optional, and if you omit it the default
// API key for that service will be used.
export const provider = (network: string, etherscanKey?: string, infuraKey?: string) => {
    const etherscan = etherscanKey ?? process.env.ETHERSCAN_API_KEY;
    const infura = infuraKey ?? process.env.INFURA_PROJECT_ID;
    if (SUPPORTED_NETWORK.hasOwnProperty(network)) {
        return ethers.getDefaultProvider(network, {
            etherscan,
            infura 
        });
    }
    throw Error(`Network not supported. Please switch to ${Object.keys(SUPPORTED_NETWORK)}`);
}

export const contract = (provider: ethers.providers.BaseProvider) => {
    return new Contract(SUPPORTED_NETWORK[provider.network.name], ABI, provider);
}

export async function getUniqueDeviceId(
    contract: Contract,
    device: {
      chip: string
      user: string
    },
  ): Promise<string> {
    const network = await contract.provider.getNetwork();
    const DOMAIN_SEPARATOR = getDomainSeparator(contract.address, network.chainId)
    return keccak256(
      solidityPack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          DOMAIN_SEPARATOR,
          keccak256(
            defaultAbiCoder.encode(
              ['bytes32', 'address', 'address'],
              [DEVICE_TYPEHASH, device.chip, device.user]
            )
          )
        ]
      )
    )
  }

export async function getData(
    contract: Contract,
    data: {
      isFirstBlock: boolean,
      previousHash: string,
      data: string
    }
  ): Promise<string> {
    const network = await contract.provider.getNetwork();
    const DOMAIN_SEPARATOR = getDomainSeparator(contract.address, network.chainId)
    return keccak256(
      solidityPack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          DOMAIN_SEPARATOR,
          keccak256(
            defaultAbiCoder.encode(
              ['bytes32', 'bool', 'bytes32', 'string'],
              [DATA_TYPEHASH, data.isFirstBlock, data.previousHash, data.data]
            )
          )
        ]
      )
    )
  }

  const getDomainSeparator = (contractAddress: string, chainId: number) => {
    return keccak256(
        defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
            [
            keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
            keccak256(toUtf8Bytes(NAME)),
            keccak256(toUtf8Bytes(VERSION)),
            chainId,
            contractAddress
            ]
        )
    )
};
