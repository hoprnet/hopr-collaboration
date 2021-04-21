import Listr from 'listr';
import { promises as fs } from 'fs';
import { generateKeyPair, sign, verify, createVerify, createPrivateKey, createPublicKey, createHash } from 'crypto';
import { BigInteger } from 'jsbn';

const RESULTS_FOLDER = './demo/';
const verifiableData = "this need to be verified"
const SIGN_INFO_HEAD = Buffer.from('3031300d060960864801650304020105000420', 'hex')

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
            title: 'Verify initial hash signature',
            task: async (ctx: Listr.ListrContext) => {
                const digest = '05AB0654C2186D2185F65B4684E651D65C1A6FF65421B5165E12D6F15B565A4F';
                const pubKeyExpHex = '10001'; 
                const pubKeyModHex1 = 'f2786604371b04eea5c0bbf861eea4513cef619960868195f3199f272988ed6101d1ec4fefdc4284f55e056c9c121a4653cd2ff68bdee6c6da6433feb48fce905127ae8d67f2d9d6968e924142b3677ca4f2ee9427832b6589deed5d25ba008eed10460872d5baa98526b0ebd47528e6316257327c7eee96d18cda2b3e32bba9';
                const signature1 = "7a9bd691d8a1cc5a3e43e519f9d0c4173f56b3a3ef33b0d2f17db3e60f4972e8639ff7723112f3d10972dd9803ada5730c10eda8296da51924b3d634bf3a96d2bbe3aa26ce435a21c8a6aec8f3a3574d0df8c16fd0a90fc98cc24fe728307c1cb67a19bc9c93c7bf9b518175ed70e6d0f4ccb5569b4f0d240f7b1b314d11fa05";
                const pubKeyModHex2 = 'b3a8a8c512faaa6e600fe9d0a78a14ebb82447c304889a034138332bf076f4fc0240a457d529db73be6e932e21176ff9ceaf58c03c362aeccfda2c61f6729ab9771957d5c6a9361c48a7cf6fc533e68f4341a3e198bb1740a0f5e31e3c7f3d34bd3910d121eebe3b4395e3b1aaac16deb084a765208bbf44c25499891f391e3b';
                const signature2 = "0x9ada866472a004308f162ce5336f2afc84bdff7dc0e539a78d4475eb1a7774330bd80deec9ba15f6295fccc4a5dda5a948179d1bc5d074fc2e695cf224e8a3a7978809723aba8882317244b182f9a502a9a9eb6d296188b4d9fc5ef1270171be6811af6d4000109bafce4ee00b3e905d58d047b341eabd3bae2cdb13ddfad818";
                // const pubKeyExpBI = new BigInteger(pubKeyExpHex);
                const value1 = new BigInteger(signature1).modPowInt(parseInt(pubKeyExpHex, 16), new BigInteger(pubKeyModHex1)).toString(16);
                const value2 = new BigInteger(signature2).modPowInt(parseInt(pubKeyExpHex, 16), new BigInteger(pubKeyModHex2)).toString(16);
                const value3 = new BigInteger(signature2).modPowInt(parseInt(pubKeyExpHex, 16), new BigInteger(pubKeyModHex1)).toString(16);
                const value4 = new BigInteger(signature1).modPowInt(parseInt(pubKeyExpHex, 16), new BigInteger(pubKeyModHex2)).toString(16);
                // const biSig = new BigInteger(signature);
                // const hash = createHash('sha256');
                // hasher.update(buffer);
                // var hash = this.pkcs1pad(rawData, hashAlgorithm);
                // var m = this.key.$doPublic(new BigInteger(signature));
                // return m.toBuffer().toString('hex') == hash.toString('hex');
                ctx.isVerified = createVerify("RSA-SHA256").update(digest).verify(createPublicKey({key: ctx.agg, format: 'pem'}), Buffer.from(signature1, 'hex'));
                // const isVerified = verify("sha256", Buffer.from(rawData), createPublicKey({key: ctx.agg, format: 'pem'}), Buffer.from(signature, 'hex'));

                ctx.testVerified11 = value1;
                ctx.testVerified12 = value2;
                ctx.testVerified21 = value3;
                ctx.testVerified22 = value4;
                // pkcs1pad
                const data = Buffer.concat([SIGN_INFO_HEAD, Buffer.from(digest, 'hex')]);
                const filled = Buffer.alloc(64 - data.length - 1);
                filled.fill(0xff, 0, filled.length - 1);
                filled[0] = 1;
                filled[filled.length - 1] = 0;

                const res = Buffer.concat([filled, data]);
                ctx.testVerified2 = res.toString('hex').substring(res.toString('hex').length-64);
                // console.log("signature verified: ", isVerified)


                // verify separately
                // mainly interested in last 32 bytes (the actual hash) - the rest is asn.1 stuff
                // (ideally we should check that too)
                // ctx.testVerified3 = publicDecrypt({key: createPublicKey({key: ctx.agg, format: 'pem', type: 'pkcs1'})}, Buffer.from(signature1, 'hex')).slice(-32).toString('hex');
                
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
        },
        {
            title: 'Test Verify: using hex public key',
            task: async (ctx: Listr.ListrContext) => {
                // const publicKeyHex = await fs.readFile(`${RESULTS_FOLDER}demo_pub_key_hex.txt`, "utf8");
                let digest = createHash('sha256');
                digest.update(verifiableData);
                ctx.digest = digest.toString();
                // const isVerified = verify("sha256", Buffer.from(verifiableData), createPublicKey({key: publicKey, format: 'pem', type: 'pkcs1'}), Buffer.from(ctx.signature, 'hex'));

                // ctx.verified = isVerified;
                // console.log("signature verified: ", isVerified)
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(ctx.agg);
    console.log(ctx.testVerified11);
    console.log(ctx.testVerified12);
    // console.log(ctx.testVerified21);
    // console.log(ctx.testVerified22);
    console.log(ctx.testVerified2);
    console.log(ctx.isVerified);
    console.log(`Created keys for demo. Results are saved in ${RESULTS_FOLDER} folder`);
    return ctx.uniqueId;
}