import Listr from 'listr';
import { constants, Signer, Wallet } from "ethers";
import { contract, provider } from "../web3/web3";

export const verify = async (
    uniqueId: string,
    isfirstblock: boolean, 
    prevhash: string, 
    data: string, 
    network: string | undefined, 
    signer: Signer | undefined
): Promise<boolean> => {
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
            title: 'Check device unique ID',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                try {
                    const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId)
                    if (registered.chip === constants.AddressZero) {
                        // Device/user pair is registered.
                        throw new Error('Unique ID does not exist');
                    }
                    task.title = 'Verify block data with unique ID';
                    // compute pubkey to ethereum address
                    const typedData: {isFirstBlock: boolean; previousHash: string; data: string} = {isFirstBlock: isfirstblock, previousHash: prevhash, data};
                    ctx.result = await ctx.contract.connect(ctx.relayer).verify(uniqueId, typedData);
                } catch (error) {
                    console.log(error)
                    task.skip(JSON.stringify(error));
                }
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`${ctx.result ? 'Verified' : 'Cannot verify'}`);
    return ctx.result;
}