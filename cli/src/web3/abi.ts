export const ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "uniqueDeviceId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "currentHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "chipSignature",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "userSignature",
          "type": "bytes"
        }
      ],
      "name": "Dumped",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "uniqueDeviceId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "chip",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "Registered",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DATA_TYPEHASH",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DEVICE_TYPEHASH",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "NAME",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "chainDevicePair",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "chipSignature",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "isFirstBlock",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "previousHash",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            }
          ],
          "internalType": "struct ChainOnAChip.Data",
          "name": "data",
          "type": "tuple"
        }
      ],
      "name": "dataOf",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "deviceRegistration",
      "outputs": [
        {
          "internalType": "address",
          "name": "chip",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "uniqueId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "newBlockHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "chipSig",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "userSig",
          "type": "bytes"
        }
      ],
      "name": "dumpHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "chip",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            }
          ],
          "internalType": "struct ChainOnAChip.Device",
          "name": "device",
          "type": "tuple"
        }
      ],
      "name": "register",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "chip",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            }
          ],
          "internalType": "struct ChainOnAChip.Device",
          "name": "device",
          "type": "tuple"
        }
      ],
      "name": "uniqueDeviceIdOf",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "userSignature",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "uniqueId",
          "type": "bytes32"
        },
        {
          "components": [
            {
              "internalType": "bool",
              "name": "isFirstBlock",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "previousHash",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            }
          ],
          "internalType": "struct ChainOnAChip.Data",
          "name": "data",
          "type": "tuple"
        }
      ],
      "name": "verify",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]