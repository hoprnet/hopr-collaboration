import Listr from 'listr';
import { promises as fs } from 'fs';
import { constants, Signer, Wallet } from "ethers";
import { BLOCK_CONFIRMATION, contract, explorerTx, provider } from "../web3/web3";

const RESULTS_FOLDER = './results/';

export const dumpHash = async (
    uniqueId: string,
    hash: string, 
    sig1: string, 
    sig2: string, 
    network: string | undefined, 
    signer: Signer | undefined
): Promise<string> => {
    let receipt;
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
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId)
                if (registered.chip === constants.AddressZero || registered.chip === "0x") {
                    // user/device pair is registered.
                    throw new Error('Unique ID does not exist');
                }
                task.title = 'Dump signed hash to Ethereum smart contract';
                // dump hash
                const tx = await ctx.contract.connect(ctx.relayer).dumpHash(uniqueId, hash, sig1, sig2);
                ctx.txHash = tx.hash;
                ctx.k1 = registered.chip;
                ctx.k2 = registered.user;
                task.title = `Register device. Broadcasted with transaction ${tx.hash}`;
                task.output = `Follow transaction status at ${explorerTx(ctx.provider, tx.hash)}`;
                receipt = await ctx.provider.waitForTransaction(tx.hash, BLOCK_CONFIRMATION);
                const block = await ctx.provider.getBlock(receipt.blockNumber);
                ctx.timestamp = block.timestamp;
            }
        },
        {
            title: 'Save dumped hash to local file',
            task: async (ctx: Listr.ListrContext) => {
                const dumpHash = {
                    uniqueId,
                    k1: ctx.k1,
                    k2: ctx.k2,
                    dataHash: hash,
                    sig1,
                    sig2,
                    txHash: ctx.txHash,
                    timestamp: ctx.timestamp
                };
                await fs.writeFile(`${RESULTS_FOLDER}dumpHash.json`, JSON.stringify(dumpHash, null, 2));
                await fs.writeFile(`${RESULTS_FOLDER}dump_hash_transaction.txt`, ctx.txHash, 'utf8');
                await fs.appendFile(`${RESULTS_FOLDER}chain.txt`, "\n"+hash.slice(2), 'utf8');
            }
        }
    ]);

    const ctx = await tasks.run();
    if (receipt) console.log(`Hash ${hash} is dumped to smart contract under ID ${uniqueId} with transaction ${ctx.txHash}`);
    return ctx.uniqueId;
}