"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.getUniqueDeviceId = exports.contract = exports.explorerBlock = exports.explorerTx = exports.provider = exports.DATA_TYPEHASH = exports.DEVICE_TYPEHASH = exports.SUPPORTED_NETWORK = exports.BLOCK_CONFIRMATION = void 0;
require('dotenv').config();
const keccak256_1 = require("@ethersproject/keccak256");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const abi_1 = require("./abi");
const NAME = 'Chain on a Chip';
const VERSION = '1';
exports.BLOCK_CONFIRMATION = 3;
// supported network
exports.SUPPORTED_NETWORK = {
    "sokol": "0x3347B4d90ebe72BeFb30444C9966B2B990aE9FcB",
    "kovan": "0x93639eb65c0e78262f9f92291e8d885039c9de0a"
};
exports.DEVICE_TYPEHASH = keccak256_1.keccak256(utils_1.toUtf8Bytes('Device(bytes,bytes)'));
exports.DATA_TYPEHASH = keccak256_1.keccak256(utils_1.toUtf8Bytes('Data(bool,bytes32,string)'));
// Specify your own API keys
// Each is optional, and if you omit it the default
// API key for that service will be used.
const provider = (network, etherscanKey, infuraKey) => {
    const etherscan = etherscanKey !== null && etherscanKey !== void 0 ? etherscanKey : process.env.ETHERSCAN_API_KEY;
    const infura = infuraKey !== null && infuraKey !== void 0 ? infuraKey : process.env.INFURA_PROJECT_ID;
    if (exports.SUPPORTED_NETWORK.hasOwnProperty(network)) {
        return network === "kovan" ? ethers_1.ethers.getDefaultProvider(network, {
            etherscan,
            infura
        }) : new ethers_1.ethers.providers.JsonRpcProvider("https://sokol.poa.network", {
            name: 'sokol',
            chainId: 77
        });
    }
    throw Error(`Network not supported. Please switch to ${Object.keys(exports.SUPPORTED_NETWORK)}`);
};
exports.provider = provider;
const explorerTx = (provider, txHash) => {
    return provider.network.name === 'sokol' ? `https://blockscout.com/poa/sokol/tx/${txHash}` : `https://${provider.network.name}.etherscan.io/tx/${txHash}`;
};
exports.explorerTx = explorerTx;
const explorerBlock = (provider, blockNumber) => {
    return provider.network.name === 'sokol' ? `https://blockscout.com/poa/sokol/blocks/${blockNumber}` : `https://${provider.network.name}.etherscan.io/block/${blockNumber}`;
};
exports.explorerBlock = explorerBlock;
const contract = (provider) => {
    return new ethers_1.Contract(exports.SUPPORTED_NETWORK[provider.network.name], abi_1.ABI, provider);
};
exports.contract = contract;
async function getUniqueDeviceId(contract, device) {
    const network = await contract.provider.getNetwork();
    const DOMAIN_SEPARATOR = getDomainSeparator(contract.address, network.chainId);
    return keccak256_1.keccak256(utils_1.solidityPack(['bytes1', 'bytes1', 'bytes32', 'bytes32'], [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256_1.keccak256(utils_1.defaultAbiCoder.encode(['bytes32', 'bytes', 'bytes'], [exports.DEVICE_TYPEHASH, device.chip, device.user]))
    ]));
}
exports.getUniqueDeviceId = getUniqueDeviceId;
async function getData(contract, data) {
    const network = await contract.provider.getNetwork();
    const DOMAIN_SEPARATOR = getDomainSeparator(contract.address, network.chainId);
    return keccak256_1.keccak256(utils_1.solidityPack(['bytes1', 'bytes1', 'bytes32', 'bytes32'], [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256_1.keccak256(utils_1.defaultAbiCoder.encode(['bytes32', 'bool', 'bytes32', 'string'], [exports.DATA_TYPEHASH, data.isFirstBlock, data.previousHash, data.data]))
    ]));
}
exports.getData = getData;
const getDomainSeparator = (contractAddress, chainId) => {
    return keccak256_1.keccak256(utils_1.defaultAbiCoder.encode(['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'], [
        keccak256_1.keccak256(utils_1.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        keccak256_1.keccak256(utils_1.toUtf8Bytes(NAME)),
        keccak256_1.keccak256(utils_1.toUtf8Bytes(VERSION)),
        chainId,
        contractAddress
    ]));
};
//# sourceMappingURL=web3.js.map