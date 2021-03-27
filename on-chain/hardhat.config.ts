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
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA}`,
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
    console.log(`${chalk.hex('#00005f').bgHex('#ffffa0')(' Greeter ')} deployed to ${contract.address}`);
});

export default hardhatConfig
