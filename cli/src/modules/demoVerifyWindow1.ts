import Listr from 'listr';
import { promises as fs } from 'fs';
// import execa from 'execa';

const RESULTS_FOLDER = './results/';

export const demoVerifyWindow1 = async (): Promise<string> => {
    const tasks = new Listr([
        {
            title: 'Read ID and data',
            task: async (ctx: Listr.ListrContext) => {
                ctx.uniqueId = await fs.readFile(`${RESULTS_FOLDER}registration_UniqueID.txt`, "utf8");
                ctx.chain = (await fs.readFile(`${RESULTS_FOLDER}chain.txt`, "utf8")).split('\n')[0];
            }
        },
        {
            title: 'Verify...',
            task: async (ctx: Listr.ListrContext, task: Listr.ListrTaskWrapper) => {
                task.title = `node dist/index verify -f ${ctx.uniqueId} ${ctx.chain} ""`;
                // return new Promise((resolve, reject) => {
                //     {
                //         const cmd = execa('node', ['dist/index', 'verify', '-f', ctx.uniqueId, ctx.chain]);
                //         cmd.then(resolve)
                //             .catch(() => {
                //               reject(new Error('Failed'));
                //             });
                //         return cmd;
                //     }
                // })
            }
        },
    ]);

    const ctx = await tasks.run();
    console.log(`Ran command:`);
    console.log(`node dist/index verify -f ${ctx.uniqueId} ${ctx.chain} ""`)
    return ctx.uniqueId;
}