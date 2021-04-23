import Listr from 'listr';
import { promises as fs } from 'fs';
import { createHash, verify, createPublicKey } from 'crypto';
import { Signer, Wallet } from "ethers";
import { contract, provider } from "../web3/web3";

const PREFIX = '30818902818100';
const APPENDIX = '0203010001';

export const verifyData = async (
    uniqueId: string,
    isfirstblock: boolean, 
    prevhash: string, 
    datapath: string, // path to the file
    network: string | undefined, 
    signer: Signer | undefined
): Promise<boolean> => {
    const tasks = new Listr([
        {
            title: 'Connect to blockchain',
            task: async (ctx) => {
                let web3Provider;
                try {
                    web3Provider = provider(network ?? '');
                } catch {
                    console.warn('No provider specified. Using default network and provider.');
                    web3Provider = provider('sokol');
                }
                const relayer = signer ?? new Wallet(process.env.LOCAL_RELAYER_PRIVATE_KEY as string, web3Provider);
                const registerContract = contract(web3Provider); 
                ctx.provider = web3Provider;
                ctx.relayer = relayer;
                ctx.contract = registerContract;
            }
        },
        {
            title: 'Check device unique ID',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                try {
                    const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId)
                    if (registered.chip === "0x") {
                        // Device/user pair is registered.
                        throw new Error('Unique ID does not exist');
                    }
                    task.title = 'Get device/user public keys with unique ID';
                    ctx.regChip = registered.chip;
                    ctx.regUser = registered.user;
                    ctx.pk1 = '-----BEGIN RSA PUBLIC KEY-----\n' + Buffer.from(PREFIX + registered.chip.slice(2) + APPENDIX, 'hex').toString('base64') + '\n-----END RSA PUBLIC KEY-----\n';
                    ctx.pk2 = '-----BEGIN RSA PUBLIC KEY-----\n' + Buffer.from(PREFIX + registered.user.slice(2) + APPENDIX, 'hex').toString('base64') + '\n-----END RSA PUBLIC KEY-----\n';
                } catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Read data',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                try {
                    const aBin = ((await fs.readFile(datapath, "utf8")) ?? "").match(/.{4}/g);
                    const a = (!aBin || aBin.length === 0 ? "" : aBin.reduce((acc: string, i: string) => acc + parseInt(i, 2).toString(16), ''));
                    const b = prevhash
                    const c = isfirstblock ? "01" : "00";
                    ctx.data = a + b + c;
                    task.title = 'Calculate digest';
                    ctx.newBlockHash = createHash('sha256').update(ctx.data).digest('hex');
                    const [ui, cs, us] = await Promise.all([
                        ctx.contract.connect(ctx.relayer).chainDevicePair('0x'+ctx.newBlockHash),
                        ctx.contract.connect(ctx.relayer).chipSignature('0x'+ctx.newBlockHash),
                        ctx.contract.connect(ctx.relayer).userSignature('0x'+ctx.newBlockHash)
                    ]);
                    ctx.ui = ui;
                    if (uniqueId !== ui) {
                        // Device/user pair is registered.
                        throw new Error('Unique ID does not match');
                    }
                    if (cs === '0x') {
                        // Device/user pair is registered.
                        throw new Error('Chip signature does not exist');
                    }
                    if (us === '0x') {
                        // Device/user pair is registered.
                        throw new Error('User signature does not exist');
                    }
                    ctx.sigChip = cs;
                    ctx.sigUser = us;
                } catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Verify...',
            task: async (ctx: Listr.ListrContext) => {
                ctx.verified1 = verify("sha256", Buffer.from(ctx.data), createPublicKey({key: ctx.pk1, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.sigChip.slice(2), 'hex'));
                ctx.verified2 = verify("sha256", Buffer.from(ctx.data), createPublicKey({key: ctx.pk2, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.sigUser.slice(2), 'hex'));
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`${ctx.verified1 && ctx.verified2? 'Verified' : `Cannot verify, due to ${ctx.verified1} and ${ctx.verified1}`}`);
    return ctx.result;
}