require('dotenv').config()
import { HardhatUserConfig, task} from 'hardhat/config'

import 'hardhat-typechain'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-solhint'
import 'solidity-coverage'

const {ETHERSCAN} = process.env

const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
    },
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

export default hardhatConfig
