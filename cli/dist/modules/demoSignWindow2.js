"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoSignWindow2 = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
const DEMO_FOLDER = './demo/keys/';
const RAW_DATA_FOLDER = './demo/data/';
const RESULTS_FOLDER = './results/';
const demoSignWindow2 = async () => {
    const tasks = new listr_1.default([
        {
            title: 'Read keys and data to be signed',
            task: async (ctx) => {
                ctx.priKey1 = await fs_1.promises.readFile(`${DEMO_FOLDER}demo_key_1.pri`, "utf8");
                ctx.priKey2 = await fs_1.promises.readFile(`${DEMO_FOLDER}demo_key_2.pri`, "utf8");
                ctx.dataBin = await fs_1.promises.readFile(`${RAW_DATA_FOLDER}data_bin_2.txt`, "utf8");
                ctx.prevHash = await fs_1.promises.readFile(`${RESULTS_FOLDER}window2_prevhash_hex.txt`, "utf8");
                ctx.uniqueId = await fs_1.promises.readFile(`${RESULTS_FOLDER}registration_UniqueID.txt`, "utf8");
            }
        },
        {
            title: 'Convert binary data to hex...',
            task: async (ctx) => {
                ctx.dataBin2Hex = ctx.dataBin.match(/.{4}/g).reduce((acc, i) => acc + parseInt(i, 2).toString(16), '');
                ctx.blockData = ctx.dataBin2Hex + ctx.prevHash + "00";
            }
        },
        {
            title: 'Calculating new hash...',
            task: async (ctx) => {
                ctx.blockHash = crypto_1.createHash('sha256').update(Buffer.from(ctx.blockData, 'hex')).digest('hex');
            }
        },
        {
            title: 'Signing...',
            task: async (ctx) => {
                ctx.signature1 = (crypto_2.sign("sha256", Buffer.from(ctx.blockData), crypto_2.createPrivateKey({ key: ctx.priKey1, format: 'pem', type: 'pkcs1' }))).toString("hex");
                ctx.signature2 = (crypto_2.sign("sha256", Buffer.from(ctx.blockData), crypto_2.createPrivateKey({ key: ctx.priKey2, format: 'pem', type: 'pkcs1' }))).toString("hex");
            }
        },
        {
            title: 'Verify...',
            task: async (ctx, task) => {
                try {
                    const publicKey1 = await fs_1.promises.readFile(`${DEMO_FOLDER}demo_key_1.pub`, "utf8");
                    const publicKey2 = await fs_1.promises.readFile(`${DEMO_FOLDER}demo_key_2.pub`, "utf8");
                    ctx.verified1 = crypto_2.verify("sha256", Buffer.from(ctx.blockData), crypto_2.createPublicKey({ key: publicKey1, format: 'pem', type: 'pkcs1' }), Buffer.from(ctx.signature1, 'hex'));
                    ctx.verified2 = crypto_2.verify("sha256", Buffer.from(ctx.blockData), crypto_2.createPublicKey({ key: publicKey2, format: 'pem', type: 'pkcs1' }), Buffer.from(ctx.signature2, 'hex'));
                    if (!ctx.verified1) {
                        // Device/user pair is registered.
                        throw new Error('First signature cannot be verified');
                    }
                    if (!ctx.verified2) {
                        // Device/user pair is registered.
                        throw new Error('Second signature cannot be verified');
                    }
                }
                catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Save to local',
            task: async (ctx) => {
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}demo_s3.txt`, ctx.signature1, 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}demo_s4.txt`, ctx.signature2, 'utf8');
                await fs_1.promises.writeFile(`${RESULTS_FOLDER}window3_prevhash_hex.txt`, ctx.blockHash, 'utf8');
            }
        },
    ]);
    const ctx = await tasks.run();
    console.log(`Created keys for demo. Results are saved in ${RESULTS_FOLDER}demo_s3.txt and ${RESULTS_FOLDER}demo_s4.txt. Next command to run:`);
    console.log(`node dist/index dumphash ${ctx.uniqueId} 0x${ctx.blockHash} 0x${ctx.signature1} 0x${ctx.signature2}`);
    return ctx.uniqueId;
};
exports.demoSignWindow2 = demoSignWindow2;
//# sourceMappingURL=demoSignWindow2.js.map