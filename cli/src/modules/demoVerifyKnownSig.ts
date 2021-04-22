import Listr from 'listr';
import { promises as fs } from 'fs';
import { verify, createPublicKey } from 'crypto';

const PREFIX = '30818902818100';
const APPENDIX = '0203010001';

export const demoVerifyKnownSig = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read ID and data',
            task: async (ctx: Listr.ListrContext) => {
                ctx.binaryData = await fs.readFile("./demo/data/data_bin.txt", "utf8");
                const publicModule1 = 'f2786604371b04eea5c0bbf861eea4513cef619960868195f3199f272988ed6101d1ec4fefdc4284f55e056c9c121a4653cd2ff68bdee6c6da6433feb48fce905127ae8d67f2d9d6968e924142b3677ca4f2ee9427832b6589deed5d25ba008eed10460872d5baa98526b0ebd47528e6316257327c7eee96d18cda2b3e32bba9';
                const publicModule2 = 'b3a8a8c512faaa6e600fe9d0a78a14ebb82447c304889a034138332bf076f4fc0240a457d529db73be6e932e21176ff9ceaf58c03c362aeccfda2c61f6729ab9771957d5c6a9361c48a7cf6fc533e68f4341a3e198bb1740a0f5e31e3c7f3d34bd3910d121eebe3b4395e3b1aaac16deb084a765208bbf44c25499891f391e3b';
                ctx.pk1Pem = '-----BEGIN RSA PUBLIC KEY-----\n' + Buffer.from(PREFIX + publicModule1 + APPENDIX, 'hex').toString('base64') + '\n-----END RSA PUBLIC KEY-----\n';
                ctx.pk2Pem = '-----BEGIN RSA PUBLIC KEY-----\n' + Buffer.from(PREFIX + publicModule2 + APPENDIX, 'hex').toString('base64') + '\n-----END RSA PUBLIC KEY-----\n';
                ctx.sig1 = '0x7a9f7fddc6dca1e71040249a850c3de9a1c00679bed4d21fbbfb5ee1a175bbbef623799ccad177a7ef98f8ec0270f19eca22f3e11eee41b8a2d3006c041d73d5350feeef397b2b9ea872c872a62e16df411d5c808e6bb7520de64904b89a1a8c14585dccbf317f82bb33e1bd4c5ab85cd54495b6769e140f4332b7acb78d7e37';
                ctx.sig2 = '0x258b28caf4043a57a6f1881e970b111150f66e222482e459bfd0671dd2fbbabd8f171a29952e188b3d6cf4aec36e0cc0511655899f1b86aa2a30499555298517f4328e3175b30fb338660effd1cb11850d4609b8debd5f37dbca50236877527feb7f15edb3ad93a1c1d6a8c01b0423f40baf3f21b4853a60d8492273b894c0ea';
            }
        },
        {
            title: 'Verify signature',
            task: async (ctx: Listr.ListrContext) => {
                ctx.verified1 = verify("sha256", Buffer.from(ctx.binaryData), createPublicKey({key: ctx.pk1Pem, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.sig1.slice(2), 'hex'));
                ctx.verified2 = verify("sha256", Buffer.from(ctx.binaryData), createPublicKey({key: ctx.pk2Pem, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.sig2.slice(2), 'hex'));
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(ctx.binaryData.length);
    console.log(ctx.verified1);
    console.log(ctx.verified2);
    return ctx.uniqueId;
}