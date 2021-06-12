"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpHash = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const ethers_1 = require("ethers");
const web3_1 = require("../web3/web3");
const RESULTS_FOLDER = './results/';
const dumpHash = async (uniqueId, hash, sig1, sig2, network, signer) => {
    let receipt;
    const tasks = new listr_1.default([
        {
            title: 'Connect to blockchain',
            task: async (ctx) => {
                let web3Provider;
                try {
                    web3Provider = web3_1.provider(network !== null && network !== void 0 ? network : '');
                }
                catch {
                    console.warn('No provider specified. Using default network and provider.');
                    web3Provider = web3_1.provider('sokol');
                }
                const relayer = signer !== null && signer !== void 0 ? signer : new ethers_1.Wallet(process.env.LOCAL_RELAYER_PRIVATE_KEY, web3Provider);
                const registerContract = web3_1.contract(web3Provider);
                ctx.provider = web3Provider;
                ctx.relayer = relayer;
                ctx.contract = registerContract;
            }
        },
        {
            title: 'Check device unique ID',
            task: async (ctx, task) => {
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId);
                if (registered.chip === ethers_1.constants.AddressZero || registered.chip === "0x") {
                    // user/device pair is registered.
                    throw new Error('Unique ID does not exist');
                }
                task.title = 'Dump signed hash to Ethereum smart contract';
                // dump hash
                const tx = await ctx.contract.connect(ctx.relayer).dumpHash(uniqueId, hash, sig1, sig2);
                ctx.txHash = tx.hash;
                ctx.k1 = registered.chip;
                ctx.k2 = registered.user;
                task.title = `Register device. Broadcasted with transaction ${tx.hash}`;
                task.output = `Follow transaction status at ${web3_1.explorerTx(ctx.provider, tx.hash)}`;
                receipt = await ctx.provider.waitForTransaction(tx.hash, web3_1.BLOCK_CONFIRMATION);
                const block = await ctx.provider.getBlock(receipt.blockNumber);
                ctx.timestamp = block.timestamp;
            }
        },
        {
            title: 'Save dumped hash to local file',
            task: async (ctx) => {
                const dumpHash = {
                    uniqueId,
                    k1: ctx.k1,
                    k2: ctx.k2,
                    dataHash: hash,
                    sig1,
                    sig2,
                    txHash: ctx.txHash,
                    timestamp: ctx.timestamp
                };
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}dumpHash.json`, JSON.stringify(dumpHash, null, 2));
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}dump_hash_transaction.txt`, ctx.txHash, 'utf8');
                await fs_1.promises.appendFile(`${RESULTS_FOLDER}chain.txt`, "\n" + hash.slice(2), 'utf8');
            }
        }
    ]);
    const ctx = await tasks.run();
    if (receipt)
        console.log(`Hash ${hash} is dumped to smart contract under ID ${uniqueId} with transaction ${ctx.txHash}`);
    return ctx.uniqueId;
};
exports.dumpHash = dumpHash;
//# sourceMappingURL=dumpHash.js.map