// SPDX-License-Identifier: GPL-3.0-only

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * Chip registration, data recording, and verification for Chain on a Chip.
 */
contract ChainOnAChip {
    using ECDSA for bytes32;

    struct Device {
        bytes chip;
        bytes user;
    }

    string public constant NAME = 'Chain on a Chip';
    string public constant VERSION = '1';

    mapping(bytes32=>Device) public deviceRegistration; // point uniqueDeviceId to Device
    mapping(bytes32=>bytes32) public chainDevicePair;   // point a on-chip block hash to its uniqueDeviceId
    mapping(bytes32=>bytes) public chipSignature;   // point an on-chip block hash to its chip signature
    mapping(bytes32=>bytes) public userSignature;   // point an on-chip block hash to its user signature

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant DEVICE_TYPEHASH = 0x34138362921763c57858cc4a6ef73b9529900134b1cd6df138575de46cef4e27; //keccak256("Device(bytes,bytes)")

    event Registered(bytes32 indexed uniqueDeviceId, bytes chip, bytes user);
    event Dumped(bytes32 indexed uniqueDeviceId, bytes32 indexed currentHash, bytes chipSignature, bytes userSignature);

    constructor() {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                chainId,
                address(this)
            )
        );
    }

    /**
     * @dev Register a device with its associated pair of Ethereum addresses
     * @param device Device that contains the pair of chip's Ethereum address and user's Ethereum address 
     */
    function register(Device memory device) external returns (bytes32) {
        require(device.chip.length > 0 && device.user.length > 0, 'Chip: device needs two public keys');
        bytes32 digest = uniqueDeviceIdOf(device);
        if (deviceRegistration[digest].chip.length > 0) {
        // Chip: Pair already registered
            return digest;
        }
        // register unique device ID
        deviceRegistration[digest] = device;
        emit Registered(digest, device.chip, device.user);
        return digest;
    }

    /**
     * @dev Save hash on chain
     * @param uniqueId Unique ID of the chip-user pair.
     * @param newBlockHash Hash of the new on-chip block
     * @param chipSig Signature from the chip
     * @param userSig Signature from the user
     */
    function dumpHash(bytes32 uniqueId, bytes32 newBlockHash, bytes memory chipSig, bytes memory userSig) external {
        require(deviceRegistration[uniqueId].chip.length > 0, 'Chip: device Id does not exist.');
        chainDevicePair[newBlockHash] = uniqueId;
        chipSignature[newBlockHash] = chipSig;
        userSignature[newBlockHash] = userSig;
        emit Dumped(uniqueId, newBlockHash, chipSig, userSig);
    }

    /**
     * @dev Compute and return the unique ID of a device (chip-user pair)
     * @param device Device that contains the pair of chip's Ethereum address and user's Ethereum address 
     */
    function uniqueDeviceIdOf(Device memory device) public view returns (bytes32) {
        // compute and return the digest
        return DOMAIN_SEPARATOR.toTypedDataHash(keccak256(abi.encode(DEVICE_TYPEHASH, device.chip, device.user)));
    }
}