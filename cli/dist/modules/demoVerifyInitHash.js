"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoVerifyInitHash = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const execa_1 = __importDefault(require("execa"));
const RESULTS_FOLDER = './results/';
const demoVerifyInitHash = async () => {
    const tasks = new listr_1.default([
        {
            title: 'Read ID and data',
            task: async (ctx) => {
                ctx.blockNumber = await fs_1.promises.readFile(`${RESULTS_FOLDER}startup_blocknumber.txt`, "utf8");
                ctx.blockHash = await fs_1.promises.readFile(`${RESULTS_FOLDER}startup_inithash_hex.txt`, "utf8");
            }
        },
        {
            title: 'Verify hash',
            task: async (ctx, task) => {
                task.title = `node dist/index verify-init-hash ${ctx.blockNumber} ${ctx.blockHash}`;
                const { stdout } = await execa_1.default('node', ['dist/index', 'verify-init-hash', ctx.blockNumber, ctx.blockHash]);
                console.log(stdout);
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`This command is equivalent to: `);
    console.log(`node dist/index verify-init-hash ${ctx.blockNumber} ${ctx.blockHash}`);
    return ctx.uniqueId;
};
exports.demoVerifyInitHash = demoVerifyInitHash;
//# sourceMappingURL=demoVerifyInitHash.js.map