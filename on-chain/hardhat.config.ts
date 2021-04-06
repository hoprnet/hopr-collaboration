require('dotenv').config()
import { HardhatUserConfig, task} from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import chalk from 'chalk'
import { promises as fs } from 'fs';
import { getDataLocalRpc } from './utils/digest';
import 'hardhat-typechain'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-solhint'
import 'solidity-coverage'
import { boolean } from 'hardhat/internal/core/params/argumentTypes';

const {ETHERSCAN, INFURA, DEPLOYER_PRIVATE_KEY} = process.env

const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA}`,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    sokol: {
      url: `https://sokol.poa.network`,
      accounts: [DEPLOYER_PRIVATE_KEY]
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.3',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './hardhat/cache',
    artifacts: './hardhat/artifacts'
  },
  typechain: {
    outDir: './types',
    target: 'ethers-v5'
  },
  etherscan: {
    apiKey: ETHERSCAN
  }
}

task('extract', 'Extract ABIs to specified folder', async (...args: any[]) => {
  return (await import('./tasks/extract')).default(args[0], args[1], args[2])
}).addFlag('target', 'Folder to output contents to')

task('deploy', 'Deploy contract to ethereum')
  .setAction(async (_taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(`Deploying to ${chalk.hex('#ffffa0').bgHex('#00005f')(` ${hre.network.name} `)}`);
    const artifact = await hre.ethers.getContractFactory('ChainOnAChip');
    const contract = await artifact.deploy();
    console.log(`${chalk.hex('#00005f').bgHex('#ffffa0')(' ChainOnAChip ')} deployed to ${contract.address}`);
});

task('demo-register', 'Display two sets of private and public keys for demo')
  .addParam('chip', 'Index of the HD wallet where chip keys are stored')
  .addParam('user', 'Index of the HD wallet whereuser keys are stored')
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const [thirdParty] = await hre.ethers.getSigners();
    const thridPartyAddress = await thirdParty.getAddress();
    const chip = new hre.ethers.utils.SigningKey(hre.ethers.Wallet.fromMnemonic((hre.network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${taskArgs.chip}`).privateKey);
    const user = new hre.ethers.utils.SigningKey(hre.ethers.Wallet.fromMnemonic((hre.network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${taskArgs.user}`).privateKey);
    console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(` Relayer `)} ${thridPartyAddress}`);
    console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(`   Chip  `)} PriKey: ${chip.privateKey} - PubKey: ${chip.publicKey}`);
    console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(`   User  `)} PriKey: ${user.privateKey} - PubKey: ${user.publicKey}`);
    console.log(`${chalk.hex('#00005f').bgHex('#ffffa0')(' Command ')} node dist/index register ${chip.publicKey} ${user.publicKey}`);
});

// task('demo-dumphash', 'Dump signed block hash')
//   .addParam('chip', 'Index of the HD wallet where chip keys are stored')
//   .addParam('user', 'Index of the HD wallet whereuser keys are stored')
//   .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
//     const [thirdParty] = await hre.ethers.getSigners();
//     const thridPartyAddress = await thirdParty.getAddress();
//     const chip = new hre.ethers.utils.SigningKey(hre.ethers.Wallet.fromMnemonic((hre.network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${taskArgs.chip}`).privateKey);
//     const user = new hre.ethers.utils.SigningKey(hre.ethers.Wallet.fromMnemonic((hre.network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${taskArgs.user}`).privateKey);
//     const hashes = (await fs.readFile('../cli/result.txt', "utf8")).split('\n');
//     const prevHash = hashes[hashes.length-1];
//     const chipSig = hre.ethers.utils.joinSignature(chip.signDigest(prevHash));
//     const digest = hre.ethers.utils.keccak256(chipSig);
//     const userSig = hre.ethers.utils.joinSignature(user.signDigest(digest));
//     console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(` Relayer `)} ${thridPartyAddress}`);
//     console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(`   Chip  `)} PriKey: ${chip.privateKey} - PubKey: ${chip.publicKey}`);
//     console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(`   User  `)} PriKey: ${user.privateKey} - PubKey: ${user.publicKey}`);
//     console.log(`${chalk.hex('#00005f').bgHex('#ffffa0')(' Command ')} node dist/index dumphash ${hashes[0]} ${prevHash} ${chipSig} ${userSig}`);
// });

task('demo-compute-and-sign-hash', 'Computes a non-first block hash with given data')
  .addParam('chip', 'Index of the HD wallet where chip keys are stored')
  .addParam('user', 'Index of the HD wallet whereuser keys are stored')
  .addParam('address', 'Contract address')
  .addParam('chain', 'Chain ID')
  .addOptionalParam('first', 'If current hash is the first block hash', true, boolean)
  .addOptionalParam('data', 'String to be included in the block', '')
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const [thirdParty] = await hre.ethers.getSigners();
    const thridPartyAddress = await thirdParty.getAddress();
    const chip = new hre.ethers.utils.SigningKey(hre.ethers.Wallet.fromMnemonic((hre.network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${taskArgs.chip}`).privateKey);
    const user = new hre.ethers.utils.SigningKey(hre.ethers.Wallet.fromMnemonic((hre.network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${taskArgs.user}`).privateKey);
    const hashes = (await fs.readFile('../cli/result.txt', "utf8")).split('\n');
    const prevHash = hashes[hashes.length-1];
    const typed = {isFirstBlock: taskArgs.first, previousHash: prevHash, data: taskArgs.first ? "" : taskArgs.data};
    console.log(typed);
    const hash = await getDataLocalRpc(taskArgs.address, taskArgs.chain, typed);

    // sign hash
    const chipSig = hre.ethers.utils.joinSignature(chip.signDigest(hash));
    const digest = hre.ethers.utils.keccak256(chipSig);
    const userSig = hre.ethers.utils.joinSignature(user.signDigest(digest));
    console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(` Relayer `)} ${thridPartyAddress}`);
    console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(`   Chip  `)} PriKey: ${chip.privateKey} - PubKey: ${chip.publicKey}`);
    console.log(`${chalk.hex('#ffffa0').bgHex('#00005f')(`   User  `)} PriKey: ${user.privateKey} - PubKey: ${user.publicKey}`);
    console.log(`${chalk.hex('#00005f').bgHex('#ffffa0')(' Command ')} node dist/index dumphash ${hashes[0]} ${hash} ${chipSig} ${userSig}`);
});

export default hardhatConfig
