// SPDX-License-Identifier: GPL-3.0-only

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * Chip registration, data recording, and verification for Chain on a Chip.
 */
contract ChainOnAChip {
    using ECDSA for bytes32;

    struct Device {
        address chip;
        address user;
    }

    struct Data {
        bool isFirstBlock;
        bytes32 previousHash;
        string data;
    }

    string public constant NAME = 'Chain on a Chip';
    string public constant VERSION = '1';

    mapping(bytes32=>Device) public deviceRegistration; // point uniqueDeviceId to Device
    mapping(bytes32=>bytes32) public chainDevicePair;   // point a on-chip block hash to its uniqueDeviceId
    mapping(bytes32=>bytes) public chipSignature;   // point an on-chip block hash to its chip signature
    mapping(bytes32=>bytes) public userSignature;   // point an on-chip block hash to its user signature

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant DEVICE_TYPEHASH = 0x04caa142a563a9b1a71ed7e9b3a7332cc8e48c07ffcf0fcea4385ed323b9dfa9; //keccak256("Device(address,address)")
    bytes32 public constant DATA_TYPEHASH = 0x2ded6c41268b45e29e29c7edc3177737efd34a9d7b4d3e99aa6a02869c5bd82a; //keccak256("Data(bool,bytes32,string)")

    event Registered(bytes32 indexed uniqueDeviceId, address indexed chip, address indexed user);
    event Dumped(bytes32 indexed uniqueDeviceId, bytes32 indexed currentHash, bytes chipSignature, bytes userSignature);

    modifier deviceWithAddress(Device memory device) {
        require(device.chip != address(0) && device.user != address(0));
        _;
    }

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
    function register(Device memory device) external deviceWithAddress(device) returns (bytes32) {
        bytes32 digest = uniqueDeviceIdOf(device);
        if (deviceRegistration[digest].chip != address(0)) {
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
        require(deviceRegistration[uniqueId].chip != address(0), 'Chip: device Id does not exist.');
        chainDevicePair[newBlockHash] = uniqueId;
        chipSignature[newBlockHash] = chipSig;
        userSignature[newBlockHash] = userSig;
        emit Dumped(uniqueId, newBlockHash, chipSig, userSig);
    }

    /**
     * @dev Verify the saved hash with original data
     * @param uniqueId Unique ID of the chip-user pair.
     * @param data Data saved in the on-chip block
     */
    function verify(bytes32 uniqueId, Data memory data) external view returns (bool){
        require(deviceRegistration[uniqueId].chip != address(0), 'Chip: device Id does not exist.');
        bytes32 hashN = dataOf(data);

        if (hashN.recover(chipSignature[hashN]) == deviceRegistration[uniqueId].chip 
            && keccak256(chipSignature[hashN]).recover(userSignature[hashN]) == deviceRegistration[uniqueId].user) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Compute and return the unique ID of a device (chip-user pair)
     * @param device Device that contains the pair of chip's Ethereum address and user's Ethereum address 
     */
    function uniqueDeviceIdOf(Device memory device) public view returns (bytes32) {
        // compute and return the digest
        return DOMAIN_SEPARATOR.toTypedDataHash(keccak256(abi.encode(DEVICE_TYPEHASH, device.chip, device.user)));
    }

    /**
     * @dev Compute and return the digest of the data signed by the chip
     * @param data Data saved in the on-chip block
     */
    function dataOf(Data memory data) public view returns (bytes32) {
        // compute and return the digest
        return DOMAIN_SEPARATOR.toTypedDataHash(keccak256(abi.encode(DATA_TYPEHASH, data.isFirstBlock, data.previousHash, data.data)));
    }
}