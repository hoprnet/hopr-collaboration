import Listr from 'listr';
import { Signer, Wallet } from "ethers";
import { getData, contract, provider } from "../web3/web3";

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
                    web3Provider = provider('kovan');
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
              ctx.blockHash = latestBlock.hash;
            }
        },
        {
            title: 'Compute hash 0',
            task: async (ctx: Listr.ListrContext) => {
              const typedData0 = {isFirstBlock: true, previousHash: ctx.blockHash, data: ""};
              ctx.hash0 = await getData(ctx.contract, typedData0);
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`Latest Ethereum block hash ${ctx.blockHash} and hash0 to be signed ${ctx.hash0}`);
    return [ctx.blockHash, ctx.hash0];
}