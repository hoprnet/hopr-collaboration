import Listr from 'listr';
import { promises as fs } from 'fs';
import execa from 'execa';

const RESULTS_FOLDER = './results/';

export const demoVerifyWindow1 = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read ID and data',
            task: async (ctx: Listr.ListrContext) => {
                ctx.uniqueId = await fs.readFile(`${RESULTS_FOLDER}registration_UniqueID.txt`, "utf8");
                ctx.hashWindow1 = await fs.readFile(`${RESULTS_FOLDER}startup_prevhash_hex.txt`, "utf8");
                ctx.hashWindow2 = await fs.readFile(`${RESULTS_FOLDER}window2_prevhash_hex.txt`, "utf8");
            }
        },
        {
            title: 'Verify window 1',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                task.title = `node dist/index verify -f ${ctx.uniqueId} ${ctx.hashWindow1} ""`;
                const {stdout} = await execa('node', ['dist/index', 'verify', '-f', ctx.uniqueId, ctx.hashWindow1, ""]);
                console.log(stdout);
            }
        },
        {
            title: 'Verify window 2',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                task.title = `node dist/index verify ${ctx.uniqueId} ${ctx.hashWindow2} "./demo/data/data_bin.txt"`;
                const {stdout} = await execa('node', ['dist/index', 'verify', ctx.uniqueId, ctx.hashWindow2, "./demo/data/data_bin.txt"]);
                console.log(stdout);
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`For window 1. Run command:`);
    console.log(`node dist/index verify -f ${ctx.uniqueId} ${ctx.hashWindow1} ""`)
    console.log(`For window 2. Run command:`);
    console.log(`node dist/index verify ${ctx.uniqueId} ${ctx.hashWindow2} "./demo/data/data_bin.txt"`)
    return ctx.uniqueId;
}