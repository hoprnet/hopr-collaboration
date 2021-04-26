"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoVerifyWindow1 = void 0;
const listr_1 = __importDefault(require("listr"));
const fs_1 = require("fs");
const execa_1 = __importDefault(require("execa"));
const RESULTS_FOLDER = './results/';
const demoVerifyWindow1 = async () => {
    const tasks = new listr_1.default([
        {
            title: 'Read ID and data',
            task: async (ctx) => {
                ctx.uniqueId = await fs_1.promises.readFile(`${RESULTS_FOLDER}registration_UniqueID.txt`, "utf8");
                ctx.hashWindow1 = await fs_1.promises.readFile(`${RESULTS_FOLDER}startup_prevhash_hex.txt`, "utf8");
                ctx.hashWindow2 = await fs_1.promises.readFile(`${RESULTS_FOLDER}window2_prevhash_hex.txt`, "utf8");
            }
        },
        {
            title: 'Verify window 1',
            task: async (ctx, task) => {
                task.title = `node dist/index verify -f ${ctx.uniqueId} ${ctx.hashWindow1} ""`;
                const { stdout } = await execa_1.default('node', ['dist/index', 'verify', '-f', ctx.uniqueId, ctx.hashWindow1, ""]);
                console.log(stdout);
            }
        },
        {
            title: 'Verify window 2',
            task: async (ctx, task) => {
                task.title = `node dist/index verify ${ctx.uniqueId} ${ctx.hashWindow2} "./demo/data/data_bin.txt"`;
                const { stdout } = await execa_1.default('node', ['dist/index', 'verify', ctx.uniqueId, ctx.hashWindow2, "./demo/data/data_bin.txt"]);
                console.log(stdout);
            }
        }
    ]);
    const ctx = await tasks.run();
    console.log(`For window 1. Run command:`);
    console.log(`node dist/index verify -f ${ctx.uniqueId} ${ctx.hashWindow1} ""`);
    console.log(`For window 2. Run command:`);
    console.log(`node dist/index verify ${ctx.uniqueId} ${ctx.hashWindow2} "./demo/data/data_bin.txt"`);
    return ctx.uniqueId;
};
exports.demoVerifyWindow1 = demoVerifyWindow1;
//# sourceMappingURL=demoVerifyWindow1.js.map