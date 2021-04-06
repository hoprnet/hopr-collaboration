import { Contract, utils } from "ethers";

const {keccak256, defaultAbiCoder, toUtf8Bytes, solidityPack} = utils;

export const DEVICE_TYPEHASH = keccak256(
    toUtf8Bytes('Device(address,address)')
);
export const DATA_TYPEHASH = keccak256(
    toUtf8Bytes('Data(bool,bytes32,string)')
);

const NAME = 'Chain on a Chip';
const VERSION = '1';

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

export async function getUniqueDeviceId(
    contract: Contract,
    device: {
      chip: string
      user: string
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
  export async function getDataLocalRpc(
    address: string,
    chainId: number,
    data: {
      isFirstBlock: boolean,
      previousHash: string,
      data: string
    }
  ): Promise<string> {
    const DOMAIN_SEPARATOR = getDomainSeparator(address, chainId)
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

export const signTransactions = async (signingKey: utils.SigningKey, message: string): Promise<{v:number, r:string, s:string}> => {
  const {r, s, v} = signingKey.signDigest(message);
  // console.log(r, s, v)
  // const result = "0x" + r.slice(2)+s.slice(2)+v.toString(16)
  // console.log(`[signature] ${result}`);
  // return result;
  return {r, s, v}
}