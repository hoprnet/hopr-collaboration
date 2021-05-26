import Listr from 'listr';
import { promises as fs } from 'fs';
import { Signer, Wallet } from "ethers";
import { BLOCK_CONFIRMATION, contract, explorerTx, getUniqueDeviceId, provider } from "../web3/web3";

const RESULTS_FOLDER = './results/';
const RESULTS_SAVE_TO = `${RESULTS_FOLDER}registration_UniqueID`;
export const register = async (pubKey1: string, pubKey2: string, network: string | undefined, signer: Signer | undefined): Promise<string> => {
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
            title: 'Compute Ethereum addresses from public keys and unique ID of the given user/device pair',
            task: async (ctx: Listr.ListrContext) => {
                // compute pubkey to ethereum address
                ctx.chip = pubKey1.substring(0, 2) === '0x' ? pubKey1 : '0x'+pubKey1;
                ctx.user = pubKey2.substring(0, 2) === '0x' ? pubKey2 : '0x'+pubKey2;
                ctx.uniqueId = await getUniqueDeviceId(ctx.contract, {chip: ctx.chip, user: ctx.user})
            }
        },
        {
            title: 'Register device',
            skip: async (ctx: Listr.ListrContext) => {
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(ctx.uniqueId)
                console.log(`user/device pair is registered.`);
                return registered.chip !== '0x';
            },
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                const tx = await ctx.contract.connect(ctx.relayer).register({chip:ctx.chip, user:ctx.user});
                ctx.hash = tx.hash;
                task.title = `Register device. Broadcasted with transaction ${tx.hash}`;
                task.output = `Follow transaction status at ${explorerTx(ctx.provider, tx.hash)}`;
                await ctx.provider.waitForTransaction(tx.hash, BLOCK_CONFIRMATION);
            }
        },
        {
            title: 'Save to local',
            task: async (ctx: Listr.ListrContext) => {
                await fs.writeFile(`${RESULTS_SAVE_TO}.txt`, ctx.uniqueId, 'utf8');
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`Key1 ${ctx.chip} and key2 ${ctx.user} are registered under ID ${ctx.uniqueId}. ${!ctx.hash ? '': `See transaction status at ${explorerTx(ctx.provider, ctx.hash)}`}. Results are saved in ${RESULTS_SAVE_TO}.txt`);
    return ctx.uniqueId;
}