"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInitHash = void 0;
const listr_1 = __importDefault(require("listr"));
const ethers_1 = require("ethers");
const web3_1 = require("../web3/web3");
const verifyInitHash = async (blocknumber, blockhash, network, signer) => {
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
            title: 'Get the blockhash from block number',
            task: async (ctx) => {
                ctx.block = await ctx.provider.getBlock(parseInt(blocknumber));
            }
        },
        {
            title: 'Verify...',
            task: async (ctx) => {
                ctx.verified = ctx.block.hash.slice(2) === blockhash;
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`${ctx.verified ? 'Verified' : `Block number and block hash do not match`}`);
    console.log(`See block at ${web3_1.explorerBlock(ctx.provider, ctx.blockNumber)}.`);
    return ctx.result;
};
exports.verifyInitHash = verifyInitHash;
//# sourceMappingURL=verifyInitHash.js.map