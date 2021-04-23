import Listr from 'listr';
import { Signer, Wallet } from "ethers";
import { contract, explorerBlock, provider } from "../web3/web3";

export const verifyInitHash = async (
    blocknumber: string, 
    blockhash: string,
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
            title: 'Get the blockhash from block number',
            task: async (ctx: Listr.ListrContext) => {
                ctx.block = await ctx.provider.getBlock(parseInt(blocknumber));
            }
        },
        {
            title: 'Verify...',
            task: async (ctx: Listr.ListrContext) => {
                ctx.verified = ctx.block.hash.slice(2) === blockhash;
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`${ctx.verified ? 'Verified' : `Block number and block hash do not match`}`);
    console.log(`See block at ${explorerBlock(ctx.provider, ctx.blockNumber)}.`)
    return ctx.result;
}