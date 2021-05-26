"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const ethers_1 = require("ethers");
const web3_1 = require("../web3/web3");
const RESULTS_FOLDER = './results/';
const RESULTS_SAVE_TO = `${RESULTS_FOLDER}registration_UniqueID`;
const register = async (pubKey1, pubKey2, network, signer) => {
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
            title: 'Compute Ethereum addresses from public keys and unique ID of the given user/device pair',
            task: async (ctx) => {
                // compute pubkey to ethereum address
                ctx.chip = pubKey1.substring(0, 2) === '0x' ? pubKey1 : '0x' + pubKey1;
                ctx.user = pubKey2.substring(0, 2) === '0x' ? pubKey2 : '0x' + pubKey2;
                ctx.uniqueId = await web3_1.getUniqueDeviceId(ctx.contract, { chip: ctx.chip, user: ctx.user });
            }
        },
        {
            title: 'Register device',
            skip: async (ctx) => {
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(ctx.uniqueId);
                console.log(`user/device pair is registered.`);
                return registered.chip !== '0x';
            },
            task: async (ctx, task) => {
                const tx = await ctx.contract.connect(ctx.relayer).register({ chip: ctx.chip, user: ctx.user });
                ctx.hash = tx.hash;
                task.title = `Register device. Broadcasted with transaction ${tx.hash}`;
                task.output = `Follow transaction status at ${web3_1.explorerTx(ctx.provider, tx.hash)}`;
                await ctx.provider.waitForTransaction(tx.hash, web3_1.BLOCK_CONFIRMATION);
            }
        },
        {
            title: 'Save to local',
            task: async (ctx) => {
                await fs_1.promises.writeFile(`${RESULTS_SAVE_TO}.txt`, ctx.uniqueId, 'utf8');
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`Key1 ${ctx.chip} and key2 ${ctx.user} are registered under ID ${ctx.uniqueId}. ${!ctx.hash ? '' : `See transaction status at ${web3_1.explorerTx(ctx.provider, ctx.hash)}`}. Results are saved in ${RESULTS_SAVE_TO}.txt`);
    return ctx.uniqueId;
};
exports.register = register;
//# sourceMappingURL=register.js.map