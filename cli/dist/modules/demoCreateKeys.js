"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoCreateKeys = void 0;
const listr_1 = __importDefault(require("listr"));
const execa_1 = __importDefault(require("execa"));
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const DEMO_FOLDER = './demo/keys/';
const demoCreateKeys = async (manualregister) => {
    const tasks = new listr_1.default([
        {
            title: 'Create two key pairs',
            task: async (ctx) => {
                await new Promise((resolve, reject) => {
                    crypto_1.generateKeyPair('rsa', {
                        modulusLength: 1024
                    }, (err, publicKeyObj, privateKeyObj) => {
                        if (err)
                            return reject(err);
                        if (!err) {
                            ctx.publicKeyPem1 = publicKeyObj.export({ type: 'pkcs1', format: 'pem' });
                            ctx.publicKeyParsed1 = publicKeyObj.export({ type: 'pkcs1', format: 'der' }).toString('hex').slice(14, -10);
                            ctx.privateKeyPem1 = privateKeyObj.export({ type: 'pkcs1', format: 'pem' });
                            resolve({ publicKeyObj, privateKeyObj });
                        }
                        else {
                            console.log(err);
                            return reject(err);
                        }
                    });
                });
                await new Promise((resolve, reject) => {
                    crypto_1.generateKeyPair('rsa', {
                        modulusLength: 1024
                    }, (err, publicKeyObj, privateKeyObj) => {
                        if (err)
                            return reject(err);
                        if (!err) {
                            // Handle errors and use the generated key pair.
                            ctx.publicKeyPem2 = publicKeyObj.export({ type: 'pkcs1', format: 'pem' });
                            ctx.publicKeyParsed2 = publicKeyObj.export({ type: 'pkcs1', format: 'der' }).toString('hex').slice(14, -10);
                            ctx.privateKeyPem2 = privateKeyObj.export({ type: 'pkcs1', format: 'pem' });
                            resolve({ publicKeyObj, privateKeyObj });
                        }
                        else {
                            console.log(err);
                            return reject(err);
                        }
                    });
                });
            }
        },
        {
            title: 'Save to local',
            task: async (ctx) => {
                await fs_1.promises.writeFile(`${DEMO_FOLDER}demo_key_1.pri`, ctx.privateKeyPem1, 'utf8');
                await fs_1.promises.writeFile(`${DEMO_FOLDER}demo_key_1.pub`, ctx.publicKeyPem1, 'utf8');
                await fs_1.promises.writeFile(`${DEMO_FOLDER}demo_pub_key_hex_1.txt`, ctx.publicKeyParsed1, 'utf8');
                await fs_1.promises.writeFile(`${DEMO_FOLDER}demo_key_2.pri`, ctx.privateKeyPem2, 'utf8');
                await fs_1.promises.writeFile(`${DEMO_FOLDER}demo_key_2.pub`, ctx.publicKeyPem2, 'utf8');
                await fs_1.promises.writeFile(`${DEMO_FOLDER}demo_pub_key_hex_2.txt`, ctx.publicKeyParsed2, 'utf8');
            }
        },
        {
            title: 'Register public keys',
            skip: async () => {
                return !(manualregister !== null && manualregister !== void 0 ? manualregister : false);
            },
            task: async (ctx) => {
                return new Promise((resolve, reject) => {
                    {
                        const cmd = execa_1.default('node', ['dist/index', 'register', ctx.publicKeyParsed1, ctx.publicKeyParsed2]);
                        cmd.then(resolve)
                            .catch(() => {
                            reject(new Error('Failed'));
                        });
                        return cmd;
                    }
                });
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`Created keys for demo. Results are saved in ${DEMO_FOLDER} folder. ${!manualregister ? 'To register demo keys, run: ' : ''}`);
    console.log(`node dist/index register ${ctx.publicKeyParsed1} ${ctx.publicKeyParsed2}`);
    return ctx.uniqueId;
};
exports.demoCreateKeys = demoCreateKeys;
//# sourceMappingURL=demoCreateKeys.js.map