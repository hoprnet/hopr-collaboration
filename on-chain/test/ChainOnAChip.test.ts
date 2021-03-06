import { ethers, network } from 'hardhat'
import { Contract, Signer, utils } from 'ethers'
import { deployContract } from "../utils/contracts";
import{ expect } from "chai";
import { it } from 'mocha';
import { SigningKey } from 'ethers/lib/utils';
import { getData, getUniqueDeviceId } from '../utils/digest';

describe('ChainOnAChip', function () {
    let thirdParty: Signer;
    let chip: SigningKey;
    let user: SigningKey;
    let ethereumContract: Contract;
    let thridPartyAddress: string;
    // let chipPublicKey: string;
    // let userPublicKey: string;
    let uniqueDeviceId: string;
  
    const getPrivateKeyFromLocalSigners = (index): SigningKey => {
        const ownerWallet = ethers.Wallet.fromMnemonic((network.config.accounts as any).mnemonic, `m/44'/60'/0'/0/${index}`);
        return new utils.SigningKey(ownerWallet.privateKey);
    }

    const reset = async () => {
        [thirdParty] = await ethers.getSigners();
        thridPartyAddress = await thirdParty.getAddress();
        chip = getPrivateKeyFromLocalSigners(7);
        user = getPrivateKeyFromLocalSigners(8);
        ethereumContract = await deployContract(thirdParty, "ChainOnAChip", null);
        // chipAddress = computeAddress(chip.privateKey);
        // userAddress = computeAddress(user.privateKey);
        uniqueDeviceId = await ethereumContract.connect(thirdParty).uniqueDeviceIdOf({chip:chip.publicKey, user:user.publicKey});

        // -----logs
        console.table([
            ["Chip", chip.privateKey, chip.publicKey],
            ["User", user.privateKey, user.publicKey],
            ["On-chain contract", ethereumContract.address],
            ["Third party", getPrivateKeyFromLocalSigners(0).privateKey, thridPartyAddress],
            ["Unique device ID", uniqueDeviceId],
        ]);
    }

    describe('integration tests', function () {
        let blockHash: string;
        let chipChainHash: Array<string> = [];
        let typedData:Array<{isFirstBlock: boolean; previousHash: string; data: string}>= [];

        before(async function () {
            await reset()
        })

        it('computes the right hash', async function () {
            const uniqueDeviceIdComputedOffchain = await getUniqueDeviceId(ethereumContract, {chip:chip.publicKey, user:user.publicKey});
            expect(uniqueDeviceId).to.equal(uniqueDeviceIdComputedOffchain);
        })

        it('has no device registered', async function () {
            const registered = await ethereumContract.connect(thirdParty).deviceRegistration(uniqueDeviceId);
            expect(registered.user).to.equal("0x");
        })

        it('registers a device', async function () {
            const tx = await ethereumContract.connect(thirdParty).register({chip:chip.publicKey, user:user.publicKey});
            console.log(await ethereumContract.provider.getTransactionReceipt(tx.hash));

            const registered = await ethereumContract.connect(thirdParty).deviceRegistration(uniqueDeviceId);
            console.log(registered)
            expect(registered.user).to.equal(user.publicKey);
            expect(registered.chip).to.equal(chip.publicKey);
        })

        it('startup get latest block', async function () {
            // startup
            const latestBlockNumber = await ethers.provider.getBlockNumber();
            const latestBlock = await ethers.provider.getBlock(latestBlockNumber);
            blockHash = latestBlock.hash;
            const typedData0 = {isFirstBlock: true, previousHash: blockHash, data: ""};
            typedData.push(typedData0);
            const hash0 = await getData(ethereumContract, typedData0);
            chipChainHash.push(hash0);
        })

        it('registers block 0', async function () {
            const currentIndex = 0;
            // sign hash
            const chipSig = utils.joinSignature(chip.signDigest(chipChainHash[currentIndex]));
            const digest = utils.keccak256(chipSig);
            const userSig = utils.joinSignature(user.signDigest(digest));

            console.table([
                ["Start block hash", blockHash],
                ["Chip sig", chipSig],
                ["Digest", digest],
                ["User sig", userSig],
            ])

            await ethereumContract.connect(thirdParty).dumpHash(uniqueDeviceId, chipChainHash[currentIndex], chipSig, userSig); 
            expect(await ethereumContract.chainDevicePair(chipChainHash[currentIndex])).to.equal(uniqueDeviceId);
            expect(await ethereumContract.chipSignature(chipChainHash[currentIndex])).to.equal(chipSig);
            expect(await ethereumContract.userSignature(chipChainHash[currentIndex])).to.equal(userSig);
        })

        it('appends a new block with some data', async function () {
            const currentIndex = 1;
            const data = "Some sample data here";
            const typed = {isFirstBlock: false, previousHash: chipChainHash[currentIndex-1], data};
            const hash = await getData(ethereumContract, typed);
            typedData.push(typed);
            chipChainHash.push(hash);

            // sign hash
            const chipSig = utils.joinSignature(chip.signDigest(chipChainHash[currentIndex]));
            const digest = utils.keccak256(chipSig);
            const userSig = utils.joinSignature(user.signDigest(digest));

            await ethereumContract.connect(thirdParty).dumpHash(uniqueDeviceId, chipChainHash[currentIndex], chipSig, userSig); 
            expect(await ethereumContract.chainDevicePair(chipChainHash[currentIndex])).to.equal(uniqueDeviceId);
            expect(await ethereumContract.chipSignature(chipChainHash[currentIndex])).to.equal(chipSig);
            expect(await ethereumContract.userSignature(chipChainHash[currentIndex])).to.equal(userSig);

        })
   
        // it('test sign', async function () {
        //     const prevHash = "0x6d98a0ec8faac714aa8b754e10bb9309f38333f34ad8565a7cf812986a3f3468";
        //     const toBeSigned = "0xc33b29d3e9bcbb6c1b68111bf4be6d7458631edee3fc748bb9c064040c0258b4";
        //     const chipSig = utils.joinSignature(chip.signDigest(toBeSigned));
        //     const digest = utils.keccak256(chipSig);
        //     const userSig = utils.joinSignature(user.signDigest(digest));
        //     console.table([
        //         ["prevHash", prevHash],
        //         ["toBeSigned", toBeSigned],
        //         ["chipSig", chipSig],
        //         ["digest", digest],
        //         ["userSig", userSig],
        //     ])
        // })

    })
  })
  