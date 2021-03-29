import Listr from 'listr';
import { constants, Signer, Wallet } from "ethers";
import { BLOCK_CONFIRMATION, contract, provider } from "../web3/web3";

export const dumpHash = async (
    uniqueId: string,
    hash: string, 
    chipSig: string, 
    userSig: string, 
    network: string | undefined, 
    signer: Signer | undefined
): Promise<string> => {
    let receipt;
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
            title: 'Check device unique ID',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                // try {
                    const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(uniqueId)
                    if (registered.chip === constants.AddressZero) {
                        // Device/user pair is registered.
                        throw new Error('Unique ID does not exist');
                    }
                    task.title = 'Dump signed hash to Ethereum smart contract';
                    // dump hash
                    const tx = await ctx.contract.connect(ctx.relayer).dumpHash(uniqueId, hash, chipSig, userSig);
                    receipt = await ctx.provider.waitForTransaction(tx.hash, BLOCK_CONFIRMATION);
                // } catch (error) {
                //     task.skip(JSON.stringify(error));
                // }
            }
        }
    ]);

    const ctx = await tasks.run();
    if (receipt) console.log(`Hash ${hash} is dumped to smart contract under ID ${uniqueId}`);
    return ctx.uniqueId;
}