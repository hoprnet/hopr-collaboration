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
const register = async (devicePubKey, userPubKey, network, signer) => {
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
            title: 'Compute Ethereum addresses from public keys and unique ID of the given device/user pair',
            task: async (ctx) => {
                // compute pubkey to ethereum address
                ctx.chip = devicePubKey.substring(0, 2) === '0x' ? devicePubKey : '0x' + devicePubKey;
                ctx.user = userPubKey.substring(0, 2) === '0x' ? userPubKey : '0x' + userPubKey;
                ctx.uniqueId = await web3_1.getUniqueDeviceId(ctx.contract, { chip: ctx.chip, user: ctx.user });
            }
        },
        {
            title: 'Register device',
            skip: async (ctx) => {
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(ctx.uniqueId);
                console.log(`Device/user pair is registered.`);
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
    console.log(`Device ${ctx.chip} and user ${ctx.user} are registered under ID ${ctx.uniqueId}. ${!ctx.hash ? '' : `See transaction status at ${web3_1.explorerTx(ctx.provider, ctx.hash)}`}. Results are saved in ${RESULTS_SAVE_TO}.txt`);
    return ctx.uniqueId;
};
exports.register = register;
//# sourceMappingURL=register.js.map