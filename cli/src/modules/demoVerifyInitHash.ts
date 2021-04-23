import Listr from 'listr';
import { promises as fs } from 'fs';
import execa from 'execa';

const RESULTS_FOLDER = './results/';

export const demoVerifyInitHash = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read ID and data',
            task: async (ctx: Listr.ListrContext) => {
                ctx.blockNumber = await fs.readFile(`${RESULTS_FOLDER}startup_blocknumber.txt`, "utf8");
                ctx.blockHash = await fs.readFile(`${RESULTS_FOLDER}startup_inithash_hex.txt`, "utf8");
            }
        },
        {
            title: 'Verify hash',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                task.title = `node dist/index verify-init-hash ${ctx.blockNumber} ${ctx.blockHash}`;
                const {stdout} = await execa('node', ['dist/index', 'verify-init-hash', ctx.blockNumber, ctx.blockHash]);
                console.log(stdout);
            }
        }
    ]);

    const ctx = await tasks.run();
    console.log(`This command is equivalent to: `);
    console.log(`node dist/index verify-init-hash ${ctx.blockNumber} ${ctx.blockHash}`)
    return ctx.uniqueId;
}