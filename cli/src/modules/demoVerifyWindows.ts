import Listr from 'listr';
import { promises as fs } from 'fs';
import execa from 'execa';

const RESULTS_FOLDER = './results/';

export const demoVerifyWindows = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read ID and data',
            task: async (ctx: Listr.ListrContext) => {
                ctx.uniqueId = await fs.readFile(`${RESULTS_FOLDER}registration_UniqueID.txt`, "utf8");
                ctx.hashWindow1 = await fs.readFile(`${RESULTS_FOLDER}startup_inithash_hex.txt`, "utf8");
                ctx.hashWindow2 = await fs.readFile(`${RESULTS_FOLDER}window2_prevhash_hex.txt`, "utf8");
            }
        },
        {
            title: 'Verify window 1',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                task.title = `node dist/index verify -f ${ctx.uniqueId} ${ctx.hashWindow1} "./demo/data/data_bin_1.txt"`;
                const {stdout} = await execa('node', ['dist/index', 'verify', '-f', ctx.uniqueId, ctx.hashWindow1, "./demo/data/data_bin_1.txt"]);
                console.log(stdout);
            }
        },
        {
            title: 'Verify window 2',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                task.title = `node dist/index verify ${ctx.uniqueId} ${ctx.hashWindow2} "./demo/data/data_bin_2.txt"`;
                const {stdout} = await execa('node', ['dist/index', 'verify', ctx.uniqueId, ctx.hashWindow2, "./demo/data/data_bin_2.txt"]);
                console.log(stdout);
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`For window 1. Run command:`);
    console.log(`node dist/index verify -f ${ctx.uniqueId} ${ctx.hashWindow1} "./demo/data/data_bin_1.txt"`)
    console.log(`\n`);
    console.log(`For window 2. Run command:`);
    console.log(`node dist/index verify ${ctx.uniqueId} ${ctx.hashWindow2} "./demo/data/data_bin_2.txt"`)
    return ctx.uniqueId;
}