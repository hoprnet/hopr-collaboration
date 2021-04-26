"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startup = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const ethers_1 = require("ethers");
const web3_1 = require("../web3/web3");
const hex_to_binary_1 = __importDefault(require("hex-to-binary"));
const RESULTS_FOLDER = './results/';
const startup = async (network, signer) => {
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
            title: 'Get the latest blockhash',
            task: async (ctx) => {
                const latestBlockNumber = await ctx.provider.getBlockNumber();
                const latestBlock = await ctx.provider.getBlock(latestBlockNumber);
                ctx.blockNumber = latestBlockNumber;
                ctx.blockHash = latestBlock.hash.slice(2);
            }
        },
        {
            title: 'Save to local',
            task: async (ctx) => {
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}chain.txt`, ctx.blockHash, 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}startup_blocknumber.txt`, ctx.blockNumber.toString(), 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}startup_inithash_hex.txt`, ctx.blockHash, 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}startup_inithash_bin.txt`, hex_to_binary_1.default(ctx.blockHash), 'utf8');
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`Latest on-chain block hash ${ctx.blockHash} of block ${ctx.blockNumber}. See block at ${web3_1.explorerBlock(ctx.provider, ctx.blockNumber)}. Results are saved under ${RESULTS_FOLDER}`);
    return [ctx.blockHash, ctx.hash0];
};
exports.startup = startup;
//# sourceMappingURL=startup.js.map