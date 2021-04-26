"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const ethers_1 = require("ethers");
const web3_1 = require("../web3/web3");
const verify = async (uniqueId, isfirstblock, prevhash, data, network, signer) => {
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
                try {
                    const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId);
                    if (registered.chip === ethers_1.constants.AddressZero) {
                        // Device/user pair is registered.
                        throw new Error('Unique ID does not exist');
                    }
                    task.title = 'Verify block data with unique ID';
                    // compute pubkey to ethereum address
                    const typedData = { isFirstBlock: isfirstblock, previousHash: prevhash, data };
                    ctx.result = await ctx.contract.connect(ctx.relayer).verify(uniqueId, typedData);
                }
                catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Save to local',
            task: async (ctx) => {
                await fs_1.promises.writeFile('./result.txt', ctx.result.toString(), 'utf8');
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`${ctx.result ? 'Verified' : 'Cannot verify'}`);
    return ctx.result;
};
exports.verify = verify;
//# sourceMappingURL=verify.js.map