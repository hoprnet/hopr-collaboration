import Listr from 'listr';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
// import { createHash, verify, createPublicKey } from 'crypto';
import { Signer, Wallet } from "ethers";
import { contract, provider } from "../web3/web3";

const RESULTS_FOLDER = './results/';

export const verifyData = async (
    uniqueId: string,
    isfirstblock: boolean, 
    prevhash: string, 
    datapath: string, // path to the file
    network: string | undefined, 
    signer: Signer | undefined
) => {
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
            title: 'Read data and compute block hash',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                try {
                    const aBin = ((await fs.readFile(datapath, "utf8")) ?? "").match(/.{4}/g);
                    const a = (!aBin || aBin.length === 0 ? "" : aBin.reduce((acc: string, i: string) => acc + parseInt(i, 2).toString(16), ''));
                    const b = prevhash
                    const c = isfirstblock ? "01" : "00";
                    ctx.data = a + b + c;
                    task.title = 'Calculate digest';
                    ctx.newBlockHash = createHash('sha256').update(Buffer.from(ctx.data, 'hex')).digest('hex');
                    const [ui, cs, us] = await Promise.all([
                        ctx.contract.connect(ctx.relayer).chainDevicePair('0x'+ctx.newBlockHash),
                        ctx.contract.connect(ctx.relayer).chipSignature('0x'+ctx.newBlockHash),
                        ctx.contract.connect(ctx.relayer).userSignature('0x'+ctx.newBlockHash)
                    ]);
                    task.title = 'Get unique ID and signatures by computed block hash and save the unique Id locally';
                    await fs.writeFile(`${RESULTS_FOLDER}verify_uniqueId_${isfirstblock? '1' : '2'}.txt`, ui, 'utf8');
                    ctx.ui = ui;
                    ctx.sigChip = cs;
                    ctx.sigUser = us;
                } catch (error) {
                    task.skip(JSON.stringify(error));
                }
            }
        },
        {
            title: 'Verify unique ID',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                if (ctx.ui !== uniqueId) {
                    throw new Error('On-chain unique ID does not match with provided uniqueId');
                }
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId)
                if (registered.chip === "0x") {
                    // user/device pair is registered.
                    throw new Error(`Provided unique ID does not exist. No key1 (K${isfirstblock? '1' : '3'}) is associated with the provided ID`);
                }
                if (registered.user === "0x") {
                    // user/device pair is registered.
                    throw new Error(`Provided unique ID does not exist. No key2 (K${isfirstblock? '2' : '4'}) is associated with the provided ID`);
                }
                task.title = 'Get user/device public keys with unique ID';
                ctx.regChip = registered.chip;
                ctx.regUser = registered.user;
        }
        },
        {
            title: 'Verify signature',
            task: async (ctx: Listr.ListrContext) => {
                if (ctx.sigChip === '0x') {
                    // signature is registered under the blockhash
                    throw new Error(`1st signature (S${isfirstblock? '1' : '3'}) does not exist`);
                }
                if (ctx.sigUser === '0x') {
                    // signature is registered under the blockhash
                    throw new Error(`2nd signature (S${isfirstblock? '2' : '4'}) does not exist`);
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
            task: async (ctx: Listr.ListrContext) => {
                await fs.writeFile(`${RESULTS_FOLDER}verify_k${isfirstblock? '1' : '3'}.txt`, ctx.regChip.slice(2), 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}verify_k${isfirstblock? '2' : '4'}.txt`, ctx.regUser.slice(2), 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}verify_S${isfirstblock? '1' : '3'}.txt`, ctx.sigChip.slice(2), 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}verify_S${isfirstblock? '2' : '4'}.txt`, ctx.sigUser.slice(2), 'utf8');
            }
        }
    ]);

    return tasks.run().catch(err => {
        console.error(err.message)
    }).then((ctx: Listr.ListrContext)=>{
        console.log("ctx.newBlockHash", ctx.newBlockHash);
        console.log(`Unique ID, public keys and signatures are saved in ${RESULTS_FOLDER}verify_+.txt`);
    });
}