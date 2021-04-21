import Listr from 'listr';
import { promises as fs } from 'fs';
import { sign, verify, createPrivateKey, createPublicKey } from 'crypto';

const DEMO_FOLDER = './demo/';
const RESULTS_FOLDER = './results/';

export const demoSignWindow1 = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read keys and data to be signed',
            task: async (ctx: Listr.ListrContext) => {
                ctx.priKey1 = await fs.readFile(`${DEMO_FOLDER}demo_key_1.pri`, "utf8");
                ctx.priKey2 = await fs.readFile(`${DEMO_FOLDER}demo_key_2.pri`, "utf8");
                ctx.data = await fs.readFile(`${RESULTS_FOLDER}startup_prevhash_hex.txt`, "utf8");
            }
        },
        {
            title: 'Signing...',
            task: async (ctx: Listr.ListrContext) => {
                ctx.signature1= (sign("sha256", Buffer.from(ctx.data), createPrivateKey({key: ctx.priKey1, format: 'pem', type: 'pkcs1'}))).toString("hex");
                ctx.signature2= (sign("sha256", Buffer.from(ctx.data), createPrivateKey({key: ctx.priKey2, format: 'pem', type: 'pkcs1'}))).toString("hex");
            }
        },
        {
            title: 'Verify...',
            task: async (ctx: Listr.ListrContext) => {
                const publicKey1 = await fs.readFile(`${DEMO_FOLDER}demo_key_1.pub`, "utf8");
                const publicKey2 = await fs.readFile(`${DEMO_FOLDER}demo_key_2.pub`, "utf8");

                ctx.verified1 = verify("sha256", Buffer.from(ctx.data), createPublicKey({key: publicKey1, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.signature1, 'hex'));;
                ctx.verified2 = verify("sha256", Buffer.from(ctx.data), createPublicKey({key: publicKey2, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.signature2, 'hex'));;
            }
        },
        {
            title: 'Save to local',
            task: async (ctx: Listr.ListrContext) => {
                await fs.writeFile(`${RESULTS_FOLDER}demo_s1.txt`, ctx.signature1, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_s2.txt`, ctx.signature2, 'utf8');
            }
        },
    ]);

    const ctx = await tasks.run();
    console.log(`Created keys for demo. Results are saved in ${RESULTS_FOLDER}demo_s1.txt and ${RESULTS_FOLDER}demo_s2.txt`);
    return ctx.uniqueId;
}