# Chain on a Chip command cine tool

Required tool that validates that a certain amount of data is indeed recorded with an authentic private key. The attack vector of reading a private key from the chip is out of scope, a production setting might contain an on-chip random number generator which is currently out of scope for this proof of concept.

Chip records data e.g. 10s of data and calculates hash in an ongoing fashion in hardware and every now and then it outputs a hash and corresponding signature. The chip is chaining hashes by incorporating the previous hash into the following hash, similar to how a public blockchain works. This on-chip blockchain allows us to prove that no data has been recorded between two blocks and by providing a genesis hash that corresponds to a public blockchain hash, it provides evidence that the data could not have been provided before the block time of that hash.

## installation
1. Install [node version manager (nvm)](https://github.com/nvm-sh/nvm)
2. Install node version 15 
    ```
    nvm install 15.12.0`
    ```
3. Use node of verion 15 
    ```
    nvm use
    ```
4. Install packages 
    ```
    yarn
    ```
5. Provide environment variables in `.env` according to the example file `.env.example`.
    - Register an [Infura API](https://infura.io/register)
    - Register an [Etherescan API](https://etherscan.io/register)
    - Provide a private key with some ETH (As the smart contract is deployed on Kovan testnet, some Kovan testnet ETH is sufficient. You can get them from [Kovan faucet](https://faucet.kovan.network/).)
6. build the package
    ```
    yarn build
    ```

## Use

> <> denotes required parameters, [] denotes optional parameters.
1. Registration (can be done while the chip is offline) 
```
node dist/index register <devicekey> <userkey> [network] [relayerkey]
```

2. Initialization / Startup
```
node dist/index startup [network] [relayerkey]
```
It returns the latest Ethereum blockhash and the digest that needs to be signed by both chip and user.

3. Runtime / recording data
```
node dist/index dumphash <uniqueid> <hash> <devicesig> <usersig> [network] [relayerkey]
```
4. Verification
```
node dist/index verify <uniqueid> <prevhash> <data> [network] [relayerkey]
```
For the first blockhash, please add a `-f` 
```
node dist/index verify -f <uniqueid> <prevhash> <data> [network] [relayerkey]
```
5. Help
```
node dist/index -h
```