require('dotenv').config()
import { HardhatUserConfig, task} from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import chalk from 'chalk'
import 'hardhat-typechain'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-solhint'
import 'solidity-coverage'

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
    console.log(`${chalk.hex('#00005f').bgHex('#ffffa0')(' Command ')} node dist/index register ${chip.publicKey} ${user.publicKey}`);
});

export default hardhatConfig
