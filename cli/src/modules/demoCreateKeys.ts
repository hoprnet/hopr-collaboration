import Listr from 'listr';
import { promises as fs } from 'fs';
import { generateKeyPair, sign, verify, createPrivateKey, createPublicKey } from 'crypto';

const RESULTS_FOLDER = './demo/';
const verifiableData = "this need to be verified"

export const demoCreateKeys = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Create two key pairs',
            task: async (ctx) => {
                return new Promise((resolve, reject) => {
                    generateKeyPair('rsa', {
                        modulusLength: 1024
                    }, (err, publicKeyObj, privateKeyObj) => {
                            if (err) return reject(err);
                            if (!err) {
                                // Handle errors and use the generated key pair.
                                ctx.publicKeyDer = publicKeyObj.export({type: 'pkcs1', format: 'der'});
                                ctx.publicKeyPem = publicKeyObj.export({type: 'pkcs1', format: 'pem'});
                                ctx.prefix = ctx.publicKeyDer.toString('hex').substring(0,14);
                                ctx.appendix = ctx.publicKeyDer.toString('hex').substring(ctx.publicKeyDer.toString('hex').length-10);
                                ctx.publicKeyParsed = ctx.publicKeyDer.toString('hex').slice(14, -10);
                                ctx.privateKeyDer = privateKeyObj.export({type: 'pkcs1', format: 'der'});
                                ctx.privateKeyPem = privateKeyObj.export({type: 'pkcs1', format: 'pem'});
                                resolve({publicKeyObj, privateKeyObj});
                            } else {
                                console.log(err);
                                return reject(err)
                            }
                    });
                });
            }
        },
        {
            title: 'Save to local',
            task: async (ctx: Listr.ListrContext) => {
                await fs.writeFile(`${RESULTS_FOLDER}demo_key.pri`, ctx.privateKeyPem, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_key.pub`, ctx.publicKeyPem, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_pub_key_hex.txt`, ctx.publicKeyParsed, 'utf8');
            }
        },
        {
            title: 'Construct public key pem from modulus',
            task: async (ctx: Listr.ListrContext) => {
                const publicModule = 'f2786604371b04eea5c0bbf861eea4513cef619960868195f3199f272988ed6101d1ec4fefdc4284f55e056c9c121a4653cd2ff68bdee6c6da6433feb48fce905127ae8d67f2d9d6968e924142b3677ca4f2ee9427832b6589deed5d25ba008eed10460872d5baa98526b0ebd47528e6316257327c7eee96d18cda2b3e32bba9';
                // const publicModule = await fs.readFile(`${RESULTS_FOLDER}demo_pub_key_hex.txt`, "utf8");

                const agg = Buffer.from(ctx.prefix+publicModule+ctx.appendix, 'hex').toString('base64');
                ctx.agg = '-----BEGIN RSA PUBLIC KEY-----\n' + agg + '\n-----END RSA PUBLIC KEY-----\n';
            }
        },
        {
            title: 'Test Sign',
            task: async (ctx: Listr.ListrContext) => {
                const privateKey = await fs.readFile(`${RESULTS_FOLDER}demo_key.pri`, "utf8");
                const signature = sign("sha256", Buffer.from(verifiableData), createPrivateKey({key: privateKey, format: 'pem', type: 'pkcs1'}));
                ctx.signature = signature.toString("hex")
            }
        },
        {
            title: 'Test Verify',
            task: async (ctx: Listr.ListrContext) => {
                const publicKey = await fs.readFile(`${RESULTS_FOLDER}demo_key.pub`, "utf8");
                const isVerified = verify("sha256", Buffer.from(verifiableData), createPublicKey({key: publicKey, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.signature, 'hex'));

                ctx.verified = isVerified;
                console.log("signature verified: ", isVerified)
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(ctx.agg);
    console.log(`Created keys for demo. Results are saved in ${RESULTS_FOLDER} folder`);
    return ctx.uniqueId;
}