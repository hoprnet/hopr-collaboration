import Listr from 'listr';
import { constants, Signer, utils, Wallet } from "ethers";
import { BLOCK_CONFIRMATION, contract, getUniqueDeviceId, provider } from "../web3/web3";

export const register = async (devicePubKey: string, userPubKey: string, network: string | undefined, signer: Signer | undefined): Promise<string> => {
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
            title: 'Compute Ethereum addresses from public keys and unique ID of the given device/user pair',
            task: async (ctx: Listr.ListrContext) => {
                // compute pubkey to ethereum address
                const deviceEthAddress = utils.computeAddress(devicePubKey);
                const userEthAddress = utils.computeAddress(userPubKey);
                ctx.chip = deviceEthAddress;
                ctx.user = userEthAddress;
                ctx.uniqueId = await getUniqueDeviceId(ctx.contract, {chip: deviceEthAddress, user: userEthAddress})
            }
        },
        {
            title: 'Register device',
            skip: async (ctx: Listr.ListrContext) => {
                const registered = await ctx.contract.connect(ctx.relayer).deviceRegistration(ctx.uniqueId)
                console.log(`Device/user pair is registered.`);
                return registered.chip !== constants.AddressZero;
            },
            task: async (ctx: Listr.ListrContext) => {
                const tx = await ctx.contract.connect(ctx.relayer).register({chip:ctx.chip, user:ctx.user});
                await ctx.provider.waitForTransaction(tx.hash, BLOCK_CONFIRMATION);
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`Device ${ctx.chip} and user ${ctx.user} are registered under ID ${ctx.uniqueId}`);
    return ctx.uniqueId;
}