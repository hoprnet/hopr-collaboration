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
5. Go to the `cli` folder and run `yarn && yarn build` to install packages and build the application
## Demo
This demo emulates the "startup" - "hash" - "sign" - "dump to blockchain" - "verify" life cycle for two windows of the chip.  
It creates a pair of chip/user public-private keys to mock the signing process done by the silicon.  
### Create a demo key pair
```
node dist/index demo-create-keys -m true
```

Key pairs are saved in `demo/keys` folder.

### Register
```
node dist/index register <k1 (chip key)> <k2 (user key)>
```
If `node dist/index demo-create-keys -m true` was run in the previous step, copy the command line in the console and run it. For example,
>```
>node dist/index register dd34dcbc59971f539f71a847a4f365979f9a6e2728c56b896ad90fad80b6d0e125de597a288430ba0870ca3a14c739293701470634d722863d9a94b91550ed77929909a89306eeee37922d505a24e133cc441bcc74836f83165beeabbb89569665956a25a2dde34704fd6417aef141697eb7141c746ee947646c3fee1f7dfce5 c28d432e463c23e9d18175bc04006f6a5a7217bc0bc58d24ba85c38967d4d8d18d0d8d3528257d772b1269f61afbc5e9fd1de0d045b4f529eb6184e64b5a1af83dfb623031dd79ac3d5ff0d69b8e5ee81eda92d46ef83e2c7b7ded59a2674f6a9afa071c2f5cfc40ac1cf34c7c3bc978b89e2525763016b3d6d8c385d603ab9f
>```

The returned unique ID is saved in the `results/registration_UniqueID.txt` file.

### Startup
```
node dist/index startup
```
It returns the latest on chain block hash and its block number, which will be saved in `results/startup_inithash_hex.txt` and in `results/startup_blocknumber.txt` respectively. The CLI will hash the blockhash with `sha256(startup_inithash_hex)` to compute the digest so that chip/user can directly sign the digest. Digest is saved in binary formate in `results/startup_inithash_bin.txt` 


### Verify startup
To check if the intial block hash matches with its block number, run 
```
node dist/index demo-verify-init-hash
```

### Runtime Window 1 - Mock signing by chip and user (mock S1, S2)
_This step can be skipped when performing an integration test, where signing is done by the Chip. If no chip is available, CLI can mock the signing process._

In window 1, CoT should sign the initial hash obtained from the Ethereum blockchain.
```
node dist/index demo-sign-window1
```

It saves chip's and user's signatures in `results/demo_s1.txt` and `results/demo_s2.txt` respectively. A new "blockchain" computed from `sha256(inithash, 00000001)` is saved in `results/window2_prevhash.txt`.

CLI will show you the next command to be run for dumping hash on chain.
### Runtime Dump the first hash 
Copy the command line in the console and run it. The command looks like:
>```
>node dist/index dumphash 0x87c11255ee1bb45ac42df16f8979707adc1ce6f4f4a1bd793677b0a9f27975f7 0xd19fab1476d774fadce33ae6fe01f9aa664e4e7b0ce634ed13f5c911433a8f2e 0x0eca640b711b19a58ef2b197c76606320b9fa3a75ab7e03a4ead42c6ef4b2f2ae9a0b6554e9a800724570adf6a4f51a609244d679834331ef2fff1974a349d536a101e6acb654484373c51f92fc63ebca9e2262c4ff1a0b1cc8b1155ee6eb50d96cb39907d8fbf43029f46770d46bab552b2a66d9b56576419bfd0337745c278 0x57b00d7e6a3eb778046b0599c63e7a0b2a1dc32059f67d91ec68a280ac9e3a62671d5d43b0e6f97277d6149fd091152644b56468b03d8ae23e89fc77dc27631b2c1a115b79ef13c7fee7f510303ecf81d80579b0f1aba98e3866cf5042479bfec58db3ce1acfe3d9e1c5129efe868d3731ec4efd40127c0a7fc141e9894af4e9
>```

A transaction hash is returned and saved in `results.dump_hash_transaction.txt`

### Runtime Window 2 - Mock signing by chip and user (mock S3, S4)
_This step can be skipped when performing an integration test, where signing is done by the Chip. If no chip is available, CLI can mock the signing process._

In window 1, CoT should sign the initial hash obtained from the Ethereum blockchain.
```
node dist/index demo-sign-window2
```

It saves chip's and user's signatures in `results/demo_s3.txt` and `results/demo_s4.txt` respectively. A demo binary data produced by the silicon is saved in `demo/data/data_bin_1.txt` (for window 1) and `demo/data/data_bin_2.txt` (for window 2). A new "blockchain" computed from `sha256(data, prevhash, 00000000)` is saved in `results/window3_prevhash.txt`.

### Runtime Dump the second hash 
Copy the command line in the console and run it. The command looks like:
>```
>node dist/index dumphash 0x87c11255ee1bb45ac42df16f8979707adc1ce6f4f4a1bd793677b0a9f27975f7 0x20d0f75af3ac1c835544e26b2a5cc3b6d1dfbeea6a0681beb0a32013d4b0b534 0x15f0813dc368d8904e4be21b09268d71993c6c7b0577af21b147d37235492159d67a5ba0628ec9b7eaafaade5c59c6c9489c2ad658cf64e0debff1ca790adc79248528bf3a2d556f468bfab0eea68c6694f7ad400093febbb075777f2008d896c1d8dacafc4d6c3925f681d00c0670f4195aaef4964fabe4b17fcba6e637d9a5 0x149b52d357d1a65b5ff58336d00c5cba45f2bdd2dc82a55c96198040aff52361165ae4c5a09ce2296b829cdc38da61063f238286cfc2cf2062487a7af83761c7410048327c76542d04269fac507f03163d988d6afc578fbc18bba43a9727b4dc5324b51f7a2ae3fcba1c1eca3c3e6b80cbb4be619d21b934f811ec82defb02c5
>```

A transaction hash is returned and saved in `results.dump_hash_transaction.txt`
### Verify hashes

```
node dist/index demo-verify-windows
```
CLI also shows two commands at the end of the execution, which can be run separately for verifying data of each window. For example
>For window 1. Run command:
>`node dist/index verify -f 0x87c11255ee1bb45ac42df16f8979707adc1ce6f4f4a1bd793677b0a9f27975f7 91deec0ddc878515811b59276062116a7b9b7f24f5a6ad0872496fae71c34079 ""`

>For window 2. Run command:
>`node dist/index verify 0x87c11255ee1bb45ac42df16f8979707adc1ce6f4f4a1bd793677b0a9f27975f7 d19fab1476d774fadce33ae6fe01f9aa664e4e7b0ce634ed13f5c911433a8f2e "./demo/data/data_bin.txt"`

It queries blockchain and saves returned values in following files in "results" folder:
- "verify_uniqueId_1.txt": unique ID associated with the block hash computed from given data of window 1.
- "verify_uniqueId_2.txt": unique ID associated with the block hash computed from given data of window 2.
- "verify_k1.txt": public key of chip (K1) associated with the block hash computed from given data of window 1.
- "verify_k2.txt": public key of user (K2) associated with the block hash computed from given data of window 1.
- "verify_k3.txt": public key of chip (K1) associated with the block hash computed from given data of window 2.
- "verify_k4.txt": public key of user (K2) associated with the block hash computed from given data of window 2.
- "verify_S1.txt": signature of chip (S1) associated with the block hash computed from given data of window 1.
- "verify_S2.txt": signature of user (S2) associated with the block hash computed from given data of window 1.
- "verify_S3.txt": signature of chip (S1) associated with the block hash computed from given data of window 2.
- "verify_S4.txt": signature of user (S2) associated with the block hash computed from given data of window 2.
### Final clean up
Before running another demo, you can delete all the keys/results of the completed demo by running `yarn demo-clean`.