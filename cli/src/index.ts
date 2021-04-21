#!/usr/bin/env node
import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';
import program from 'commander';
import { register } from './modules/register';
import { startup } from './modules/startup';
import { dumpHash } from './modules/dumpHash';
import { verifyData } from './modules/verifyData';
import { demoCreateKeys } from './modules/demoCreateKeys';
import { demoSignWindow1 } from './modules/demoSignWindow1';
import { demoVerifyWindow1 } from './modules/demoVerifyWindow1';

clear();
console.log(
  chalk.green(
    figlet.textSync('Chain on a Chip', { horizontalLayout: 'full' })
  )
);

const cli = async () => {
  program
    .version('0.0.1')
    .description("HOPR CLI for Chain on a Chip");
  
  // yarn dev demo-create-keys
  program
    .command('demo-create-keys [manual]')
    .description('Create a pair of RSA keys for demo')
    .option('-m, --manualregister', 'seperate register process')
    .action(async (options) => {
      await demoCreateKeys(options.manualregister);
    })
  // yarn dev demo-create-keys
  program
    .command('demo-sign-window1')
    .description('Mock signing by the chip for window 1')
    .action(async () => {
      await demoSignWindow1();
    })
  program
    .command('demo-verify-window1')
    .description('Shortcut for verifying window 1')
    .action(async () => {
      await demoVerifyWindow1();
    })

  // yarn dev register 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
  program
    .command('register <devicekey> <userkey> [network] [relayerkey]')
    .description('Register the device and user pair Ethereum smart contract and returns their unique ID')
    .action(async (deviceKey, userkey, network, relayerkey) => {
      await register(deviceKey, userkey, network, relayerkey);
    })
  
  // yarn dev startup
  program
    .command('startup [network] [relayerkey]')
    .description('Returns the latest block hash of Ethereum blockchain and typed hash 0 to be signed by the device')
    .action(async (network, relayerkey) => {
      await startup(network, relayerkey);
    });
  
  // yarn dev dumphash 0x13ca41d4bb73168c5a8edd549fd59ac673b7926798e1d56509c45be832fcf018 0x4b3cc390b9067686f13bb3722f2a9bfdc4cb53e041116b14c46f154276e892d0 0x9382d736097baa6a6823156186825442ffb7e8e6b0b85d3a9520c101e01e8c1d6c9196c8b948f0100171196ba5006690a741fc7a3d76ae45af9e13c279cd6ad51c 0xb0ab10b8b91d05a4f6d7425d1ffa9c81936bd7409036bba759a9554997590bcd003661fdbc857da8c544797920d54ddf12be27eb1602a3baf3ae760def45b1731b
  program
    .command('dumphash <uniqueid> <hash> <devicesig> <usersig> [network] [relayerkey]')
    .description('Dump the latest blockhash to Ethereum blockchain')
    .action(async (uniqueid, hash, devicesig, usersig, network, relayerkey) => {
      await dumpHash(uniqueid, hash, devicesig, usersig, network, relayerkey);
    });

  // yarn dev verify -f 0x13ca41d4bb73168c5a8edd549fd59ac673b7926798e1d56509c45be832fcf018 0x8f6b072a5ca7816f308a6952d6348dd8247682cce17f2f01e63ee26dcd0ef043 ''
  program
    .command('verify')
    .arguments('<uniqueid> <prevhash> <data> [network] [relayerkey]')
    .option('-f, --isfirstblock', 'first block')
    .description('Verify block data with unique device ID ')
    .action(async (uniqueid, prevhash, datapath, network, relayerkey, options) => {
      await verifyData(uniqueid, options.isfirstblock, prevhash, datapath, network, relayerkey);
    });
  
  await program.parseAsync(process.argv);
}

cli();
