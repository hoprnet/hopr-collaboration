"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyData = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const crypto_1 = require("crypto");
// import { createHash, verify, createPublicKey } from 'crypto';
const ethers_1 = require("ethers");
const web3_1 = require("../web3/web3");
const RESULTS_FOLDER = './results/';
const verifyData = async (uniqueId, isfirstblock, prevhash, datapath, // path to the file
network, signer) => {
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
            title: 'Read data and compute block hash',
            task: async (ctx, task) => {
                var _a;
                try {
                    const aBin = ((_a = (await fs_1.promises.readFile(datapath, "utf8"))) !== null && _a !== void 0 ? _a : "").match(/.{4}/g);
                    const a = (!aBin || aBin.length === 0 ? "" : aBin.reduce((acc, i) => acc + parseInt(i, 2).toString(16), ''));
                    const b = prevhash;
                    const c = isfirstblock ? "01" : "00";
                    ctx.data = a + b + c;
                    task.title = 'Calculate digest';
                    ctx.newBlockHash = crypto_1.createHash('sha256').update(ctx.data).digest('hex');
                    const [ui, cs, us] = await Promise.all([
                        ctx.contract.connect(ctx.relayer).chainDevicePair('0x' + ctx.newBlockHash),
                        ctx.contract.connect(ctx.relayer).chipSignature('0x' + ctx.newBlockHash),
                        ctx.contract.connect(ctx.relayer).userSignature('0x' + ctx.newBlockHash)
                    ]);
                    task.title = 'Get unique ID and signatures by computed block hash and save the unique Id locally';
                    await fs_1.promises.writeFile(`${RESULTS_FOLDER}verify_uniqueId_${isfirstblock ? '1' : '2'}.txt`, ui, 'utf8');
                    ctx.ui = ui;
                    ctx.sigChip = cs;
                    ctx.sigUser = us;
                }
                catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Verify unique ID',
            task: async (ctx, task) => {
                if (ctx.ui !== uniqueId) {
                    throw new Error('On-chain unique ID does not match with provided uniqueId');
                }
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId);
                if (registered.chip === "0x") {
                    // Device/user pair is registered.
                    throw new Error(`Provided unique ID does not exist. No chip key (K${isfirstblock ? '1' : '3'}) is associated with the provided ID`);
                }
                if (registered.user === "0x") {
                    // Device/user pair is registered.
                    throw new Error(`Provided unique ID does not exist. No user key (K${isfirstblock ? '2' : '4'}) is associated with the provided ID`);
                }
                task.title = 'Get device/user public keys with unique ID';
                ctx.regChip = registered.chip;
                ctx.regUser = registered.user;
            }
        },
        {
            title: 'Verify signature',
            task: async (ctx) => {
                if (ctx.sigChip === '0x') {
                    // signature is registered under the blockhash
                    throw new Error(`Chip signature (S${isfirstblock ? '1' : '3'}) does not exist`);
                }
                if (ctx.sigUser === '0x') {
                    // signature is registered under the blockhash
                    throw new Error(`User signature (S${isfirstblock ? '2' : '4'}) does not exist`);
                }
            }
        },
        // {
        //     title: 'Compute',
        //     task: async (ctx: Listr.ListrContext) => {
        //         const PREFIX = '30818902818100';
        //         const APPENDIX = '0203010001';
        //         ctx.pk1 = '-----BEGIN RSA PUBLIC KEY-----\n' + Buffer.from(PREFIX + ctx.regChip.slice(2) + APPENDIX, 'hex').toString('base64') + '\n-----END RSA PUBLIC KEY-----\n';
        //         ctx.pk2 = '-----BEGIN RSA PUBLIC KEY-----\n' + Buffer.from(PREFIX + ctx.regUser.slice(2) + APPENDIX, 'hex').toString('base64') + '\n-----END RSA PUBLIC KEY-----\n';
        //         ctx.verified1 = verify("sha256", Buffer.from(ctx.data), createPublicKey({key: ctx.pk1, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.sigChip.slice(2), 'hex'));
        //         ctx.verified2 = verify("sha256", Buffer.from(ctx.data), createPublicKey({key: ctx.pk2, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.sigUser.slice(2), 'hex'));
        //     }
        // },
        {
            title: 'Save public keys and signatures to local',
            task: async (ctx) => {
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}verify_k${isfirstblock ? '1' : '3'}.txt`, ctx.regChip.slice(2), 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}verify_k${isfirstblock ? '2' : '4'}.txt`, ctx.regUser.slice(2), 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}verify_S${isfirstblock ? '1' : '3'}.txt`, ctx.sigChip.slice(2), 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}verify_S${isfirstblock ? '2' : '4'}.txt`, ctx.sigUser.slice(2), 'utf8');
            }
        }
    ]);
    return tasks.run().catch(err => {
        console.error(err.message);
    }).then((ctx) => {
        console.log("ctx.newBlockHash", ctx.newBlockHash);
        console.log(`Unique ID, public keys and signatures are saved in ${RESULTS_FOLDER}verify_+.txt`);
    });
};
exports.verifyData = verifyData;
//# sourceMappingURL=verifyData.js.map