# hopr-collaboration

Collaboration project: PoC for Chain on a Chip.

## Structure
There are two folders in this repo: `cli` is for the command interface of the node application; `on-chain` contains source code of the smart contract.
### on-chain
Contract can be deployed with `yarn deploy`. By default, it gets deployed to Sokol network.

### cli
Please see the README file for more details.

## Installation
0. [Clone](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) this GitHub repo to your local machine. 
1. Install [node version manager (nvm)](https://github.com/nvm-sh/nvm)
2. Install node version 15 
    ```
    nvm install 15.12.0
    ```
3. Use node of verion 15 
    ```
    nvm use
    ```
4. Install [yarn](https://yarnpkg.com/lang/en/docs/install/)
5. At root level, run the following commands to install packages
```
yarn install-all
yarn env-all
yarn build-all
```

## Demo
### Setup
1. Follow [Installation](##Installation)
2. In current terminal tab (A) and go to the `cli` folder
```
cd cli
nvm use
```
3. Open another terminal tab (B) and go to the `on-chain` folder
```
cd on-chain
nvm use
```

### Create a demo key pair
```
node dist/index demo-create-keys -m true
```
If you want to automatically "register" (next step) the created demo key pairs without runnign an additional command, run 
```
node dist/index demo-create-keys -m false
```

Key pairs are saved in `demo` folder.


### Register
```
node dist/index register <k1 (chip key)> <k2 (user key)>
```

The returned unique ID is saved in the `results/registration_UniqueID.txt` file.

### Startup
```
node dist/index startup
```
It returns the latest on chain block hash, which will be saved in `results/startup_prevhash_hex.txt`. The CLI will hash the blockhash with `sha256(startup_prevhash_hex)` to compute the digest so that chip/user can directly sign the digest. Digest is saved in binary formate in `results/startup_inithash_to_sign_bin.txt` 

### Window 1 - Mock signing by chip and user (mock S1, S2)
_This step can be skipped when performing an integration test, where signing is done by the Chip. If no chip is available, CLI can mock the signing process._

In window 1, CoT should sign the initial hash obtained from the Ethereum blockchain.

### Runtime - dump hash
#### First hash 
1. In terminal B, run
```
yarn demo-dumphash --chip 1 --user 2 --first true --address 0x9A676e781A523b5d0C0e43731313A708CB607508 --chain 77
```
where both indexes are exactly the same as in [Register](###Register).

This test command will automatically pull the block hash returned from blockchain at step [Startup](###Startup) from the `result.txt` file as the `previousHash` to construct the data that will be later signed by both chip and user.

2. Copy the "Command" `node dist/index ... ` to terminal A and run, e.g.
```
node dist/index dumphash 0x0ce4034bc8b5d89af6634b99fa58da8af39174ee205b206d8c20a6257432b0ac 0x13e4422a8db5c5b4f9dc15d3d8d5576009cf08f1a14e9d598d361ebfc468738d 0x3b0fbf53f03acb30b7846d4be14c66c1c79821d36f3fa068dc2916ccd6b938b136a41c7e581bf5e478640a96df9a7855185b9751ef9d5b92df630a9fbbe2fdb81b 0xf43e575b371b0f70cd81c4e3732c60819dd233e1e409febce71d0607726cf59340455ceb20118b5964f7a45443c15fc5a5ed2bbf2a7962faf4be85e4a6b9c0d41c
```
#### Other hash 
1. In terminal B, run
```
yarn demo-dumphash --chip 1 --user 2 --first false --data "some test data here" --address 0x9A676e781A523b5d0C0e43731313A708CB607508 --chain 77
```
where both indexes are exactly the same as in [Register](###Register).
You can replace the `"some test data here"` with whatever data you prefer.

2. Copy the "Command" `node dist/index ... ` to terminal A and run, e.g.
```
node dist/index dumphash 0x0ce4034bc8b5d89af6634b99fa58da8af39174ee205b206d8c20a6257432b0ac 0x4a97086e6e167f6ce080bda50871b97d6833efaa46b01d94c3381c46bf0d4fba 0x4192e2c64ea27144776bb7c0ae19e261ef9bd2674c8754da493c15e75a4b9abe5839537b6192bae2f02abf63554d7c47b77a609b9c3da20177e4d6a5eba98adb1c 0xd791ad890a23645be687edadeffa5c21bd7b58011bb8b946f248f3ddaeb3d3c17dca75460fdd67e275e80169b695cb2b198aa00485988fdfc8f334db6ab4da521b
```

### Verify - onchain
This part will be moved from onchain to offchain. The current documentation is valid for on-chain verification. 

#### First block
1. In terminal B, run
```
yarn demo-verify --index 1 --first true
```
where index refers to the index of hash saved in the `result.txt` file. For start-block, the value is 1.

2. Copy the "Command" `node dist/index ... ` to terminal A and run, e.g.
```
node dist/index verify -f 0x0ce4034bc8b5d89af6634b99fa58da8af39174ee205b206d8c20a6257432b0ac 0x9c0039cd49ee6213c0e0acddc9e2bf167a82b555c9ff64263879705bc6466644 ""
```
#### Other blocks
1. In terminal B, run
```
yarn demo-verify --index 2 --first false --data "some test data here"
```

where index refers to the index of hash saved in the `result.txt` file. The minimum value is 1 (start block).
You can replace the `"some test data here"` with the data you used in the previous step.
```
node dist/index verify  0x0ce4034bc8b5d89af6634b99fa58da8af39174ee205b206d8c20a6257432b0ac 0x13e4422a8db5c5b4f9dc15d3d8d5576009cf08f1a14e9d598d361ebfc468738d "some test data here"
```
