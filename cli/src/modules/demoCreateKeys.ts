import Listr from 'listr';
import execa from 'execa';
import { promises as fs } from 'fs';
import { generateKeyPair, sign, verify, createPrivateKey, createPublicKey } from 'crypto';

const RESULTS_FOLDER = './demo/';
const verifiableData = "this need to be verified"
const PREFIX = '30818902818100';
const APPENDIX = '0203010001';

export const demoCreateKeys = async (manualregister: boolean): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Create two key pairs',
            task: async (ctx) => {
                await new Promise((resolve, reject) => {
                    generateKeyPair('rsa', {
                        modulusLength: 1024
                    }, (err, publicKeyObj, privateKeyObj) => {
                            if (err) return reject(err);
                            if (!err) {
                                ctx.publicKeyPem1 = publicKeyObj.export({type: 'pkcs1', format: 'pem'});
                                ctx.publicKeyParsed1 = publicKeyObj.export({type: 'pkcs1', format: 'der'}).toString('hex').slice(14, -10);
                                ctx.privateKeyPem1 = privateKeyObj.export({type: 'pkcs1', format: 'pem'});
                                resolve({publicKeyObj, privateKeyObj});
                            } else {
                                console.log(err);
                                return reject(err)
                            }
                    });
                });
                await new Promise((resolve, reject) => {
                    generateKeyPair('rsa', {
                        modulusLength: 1024
                    }, (err, publicKeyObj, privateKeyObj) => {
                            if (err) return reject(err);
                            if (!err) {
                                // Handle errors and use the generated key pair.
                                ctx.publicKeyPem2 = publicKeyObj.export({type: 'pkcs1', format: 'pem'});
                                ctx.publicKeyParsed2 = publicKeyObj.export({type: 'pkcs1', format: 'der'}).toString('hex').slice(14, -10);
                                ctx.privateKeyPem2 = privateKeyObj.export({type: 'pkcs1', format: 'pem'});
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
                await fs.writeFile(`${RESULTS_FOLDER}demo_key_1.pri`, ctx.privateKeyPem1, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_key_1.pub`, ctx.publicKeyPem1, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_pub_key_hex_1.txt`, ctx.publicKeyParsed1, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_key_2.pri`, ctx.privateKeyPem2, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_key_2.pub`, ctx.publicKeyPem2, 'utf8');
                await fs.writeFile(`${RESULTS_FOLDER}demo_pub_key_hex_2.txt`, ctx.publicKeyParsed2, 'utf8');
            }
        },
        {
            title: 'Construct public key pem from modulus',
            task: async (ctx: Listr.ListrContext) => {
                const publicModule = 'f2786604371b04eea5c0bbf861eea4513cef619960868195f3199f272988ed6101d1ec4fefdc4284f55e056c9c121a4653cd2ff68bdee6c6da6433feb48fce905127ae8d67f2d9d6968e924142b3677ca4f2ee9427832b6589deed5d25ba008eed10460872d5baa98526b0ebd47528e6316257327c7eee96d18cda2b3e32bba9';
                // const publicModule = await fs.readFile(`${RESULTS_FOLDER}demo_pub_key_hex.txt`, "utf8");

                const agg = Buffer.from(PREFIX + publicModule + APPENDIX, 'hex').toString('base64');
                ctx.agg = '-----BEGIN RSA PUBLIC KEY-----\n' + agg + '\n-----END RSA PUBLIC KEY-----\n';
            }
        },
        {
            title: 'Register public keys',
            skip: async () => {
                return !(manualregister?? false);
            },
            task: async (ctx: Listr.ListrContext) => {
                return new Promise((resolve, reject) => {
                    {
                        const cmd = execa('node', ['dist/index', 'register', ctx.publicKeyParsed1, ctx.publicKeyParsed2]);
                        cmd.then(resolve)
                            .catch(() => {
                              reject(new Error('Failed'));
                            });
                        return cmd;
                    }
                })
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
    console.log(`Created keys for demo. Results are saved in ${RESULTS_FOLDER} folder. ${!manualregister ? 'To register demo keys, run: ':''}`);
    console.log(`node dist/index register ${ctx.publicKeyParsed1} ${ctx.publicKeyParsed2}`)
    return ctx.uniqueId;
}