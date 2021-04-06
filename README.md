# hopr-collaboration

Collaboration project: PoC for Chain on a Chip.

## Structure
There are two folders in this repo: `cli` is the command interface of the node application; `on-chain` is the smart contract.
### on-chain
Contract can be deployed with `yarn deploy`. By default, it gets deployed to Kovan network.

### cli
Please see the README file for more details.

## Installation
1. At root level, run the following commands to install packages
```
yarn install-all
yarn build-all
```

## Demo
### Setup
1. Follow [Installation](##Installation)
2. In current terminal tab (A) and go to the `cli` folder
```
cd cli
```
3. Open another terminal tab (B) and go to the `on-chain` folder
```
cd on-chain
```
### Register
1. In terminal B, run 
```
yarn demo-register --chip 1 --user 2
```
where `1` and `2` stands for the index of public keys given by the test setup. 

2. Copy the "Command" `node dist/index ... ` to terminal A and run, e.g.
`node dist/index register 0x04ba5734d8f7091719471e7f7ed6b9df170dc70cc661ca05e688601ad984f068b0d67351e5f06073092499336ab0839ef8a521afd334e53807205fa2f08eec74f4 0x049d9031e97dd78ff8c15aa86939de9b1e791066a0224e331bc962a2099a7b1f0464b8bbafe1535f2301c72c2cb3535b172da30b02686ab0393d348614f157fbdb`

The returned unique ID is saved in the `result.txt` file.