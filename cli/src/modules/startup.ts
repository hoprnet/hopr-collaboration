import Listr from 'listr';
import { promises as fs } from 'fs';
import { Signer, Wallet } from "ethers";
import { contract, provider, explorerBlock } from "../web3/web3";
import hexToBinary from "hex-to-binary";

const RESULTS_FOLDER = './results/';

export const startup = async (network: string | undefined, signer: Signer | undefined): Promise<[string, string]> => {
    const tasks = new Listr([
        {
            title: 'Connect to Ethereum blockchain',
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
            title: 'Get the latest blockhash',
            task: async (ctx: Listr.ListrContext) => {
              const latestBlockNumber = await ctx.provider.getBlockNumber();
              const latestBlock = await ctx.provider.getBlock(latestBlockNumber);
              ctx.blockNumber = latestBlockNumber;
              ctx.blockHash = latestBlock.hash.slice(2);
            }
        },
        {
            title: 'Save to local',
            task: async (ctx: Listr.ListrContext) => {
                await fs.writeFile(`${RESULTS_FOLDER}chain.txt`, ctx.blockHash, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}startup_inithash_hex.txt`, ctx.blockHash, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}startup_inithash_bin.txt`, hexToBinary(ctx.blockHash), 'utf8');
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`Latest on-chain block hash ${ctx.blockHash}. See block at ${explorerBlock(ctx.provider, ctx.blockNumber)}. Results are saved under ${RESULTS_FOLDER}`);
    return [ctx.blockHash, ctx.hash0];
}