import Listr from 'listr';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { sign, verify, createPrivateKey, createPublicKey } from 'crypto';

const DEMO_FOLDER = './demo/keys/';
const RAW_DATA_FOLDER = './demo/data/';
const RESULTS_FOLDER = './results/';

export const demoSignWindow2 = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read keys and data to be signed',
            task: async (ctx: Listr.ListrContext) => {
                ctx.priKey1 = await fs.readFile(`${DEMO_FOLDER}demo_key_1.pri`, "utf8");
                ctx.priKey2 = await fs.readFile(`${DEMO_FOLDER}demo_key_2.pri`, "utf8");
                ctx.dataBin = await fs.readFile(`${RAW_DATA_FOLDER}data_bin_2.txt`, "utf8");
                ctx.prevHash = await fs.readFile(`${RESULTS_FOLDER}window2_prevhash_hex.txt`, "utf8");
                ctx.uniqueId = await fs.readFile(`${RESULTS_FOLDER}registration_UniqueID.txt`, "utf8");
            }
        },
        {
            title: 'Convert binary data to hex...',
            task: async (ctx: Listr.ListrContext) => {
                ctx.dataBin2Hex = ctx.dataBin.match(/.{4}/g).reduce((acc: string, i: string) => acc + parseInt(i, 2).toString(16), '');
                ctx.blockData = ctx.dataBin2Hex + ctx.prevHash + "00";
            }
        },
        {
            title: 'Calculating new hash...',
            task: async (ctx: Listr.ListrContext) => {
                ctx.blockHash = createHash('sha256').update(Buffer.from(ctx.blockData, 'hex')).digest('hex');
            }
        },
        {
            title: 'Signing...',
            task: async (ctx: Listr.ListrContext) => {
                ctx.signature1 = (sign("sha256", Buffer.from(ctx.blockData), createPrivateKey({key: ctx.priKey1, format: 'pem', type: 'pkcs1'}))).toString("hex");
                ctx.signature2 = (sign("sha256", Buffer.from(ctx.blockData), createPrivateKey({key: ctx.priKey2, format: 'pem', type: 'pkcs1'}))).toString("hex");
            }
        },
        {
            title: 'Verify...',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                try {
                    const publicKey1 = await fs.readFile(`${DEMO_FOLDER}demo_key_1.pub`, "utf8");
                    const publicKey2 = await fs.readFile(`${DEMO_FOLDER}demo_key_2.pub`, "utf8");
                    ctx.verified1 = verify("sha256", Buffer.from(ctx.blockData), createPublicKey({key: publicKey1, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.signature1, 'hex'));
                    ctx.verified2 = verify("sha256", Buffer.from(ctx.blockData), createPublicKey({key: publicKey2, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.signature2, 'hex'));
                    if (!ctx.verified1) {
                        // user/device pair is registered.
                        throw new Error('First signature cannot be verified');
                    }
                    if (!ctx.verified2) {
                        // user/device pair is registered.
                        throw new Error('Second signature cannot be verified');
                    }
                } catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Save to local',
            task: async (ctx: Listr.ListrContext) => {
                await fs.writeFile(`${RESULTS_FOLDER}demo_s3.txt`, ctx.signature1, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_s4.txt`, ctx.signature2, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}window3_prevhash_hex.txt`, ctx.blockHash, 'utf8');
            }
        },
    ]);

    const ctx = await tasks.run();
    console.log(`Created keys for demo. Results are saved in ${RESULTS_FOLDER}demo_s3.txt and ${RESULTS_FOLDER}demo_s4.txt. Next command to run:`);
    console.log(`node dist/index dumphash ${ctx.uniqueId} 0x${ctx.blockHash} 0x${ctx.signature1} 0x${ctx.signature2}`)
    return ctx.uniqueId;
}