# HOPR Collaboration

## HOPR net

HOPR is a privacy-preserving messaging protocol that incentivizes users to participate in the network. It provides privacy by relaying messages via several relay nodes to the recipient. Relay nodes are getting paid via payment channels for their services.

## Chain on a Chip

Chip records data e.g. 10s of data and calculates hash in an ongoing fashion in hardware and every now and then it outputs a hash and corresponding signature. The chip is chaining hashes by incorporating the previous hash into the following hash, similar to how a public blockchain works. This on-chip blockchain allows us to prove that no data has been recorded between two blocks and by providing a genesis hash that corresponds to a public blockchain hash, it provides evidence that the data could not have been provided before the block time of that hash.


### Installation

- Set node version
    ```
    nvm use
    ```
    This command is always required when opening a new terminal window. 
- Install packages 
    ```
    yarn
    ```

- Compile contracts
    ```
    yarn build
    ```
- Test contracts
    ```
    yarn test
    ```
- Test coverage
    ```
    yarn coverage
    ```
- Deploy a new smart contract to Sokol network
    ```
    yarn deploy
    ```
    It wil return a newly deployed contract address. This address can later be saved in the `chain-on-a-chip/cli/src/web3/web3.ts` file, L.14. Noted that a `yarn build` under the `cli` folder is needed, when any code in that folder is changed. 

### Data structure

Device registration hash is computed from 
```
keccak256(
    "\x19\x01", 
    keccak256(
        keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
        keccak256('Chain on a Chip'),
        keccak256('1'),
        chainId,
        contractAddress
    ),
    keccak256(
        keccak256('Device(address,address)'), 
        chipAddress, 
        userAddress,
    )
)
```
Block registration hash is computed from
```
keccak256(
    "\x19\x01", 
    keccak256(
        keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
        keccak256('Chain on a Chip'),
        keccak256('1'),
        chainId,
        contractAddress
    ),
    keccak256(
        keccak256('Data(bool,bytes32,string)'), 
        isFirstBlock, 
        previousHash, 
        data
    )
)
```
### Status

Current code coverage is 
```
-------------------|----------|----------|----------|----------|----------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------|----------|----------|----------|----------|----------------|
 contracts/        |    90.48 |       50 |      100 |     91.3 |                |
  ChainOnAChip.sol |    90.48 |       50 |      100 |     91.3 |         68,104 |
-------------------|----------|----------|----------|----------|----------------|
All files          |    90.48 |       50 |      100 |     91.3 |                |
-------------------|----------|----------|----------|----------|----------------|
```