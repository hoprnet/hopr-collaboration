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
        "indexed": false,
        "internalType": "bytes",
        "name": "chip",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "user",
        "type": "bytes"
      }
    ],
    "name": "Registered",
    "type": "event"
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "deviceRegistration",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "chip",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "user",
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
            "internalType": "bytes",
            "name": "chip",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "user",
            "type": "bytes"
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
            "internalType": "bytes",
            "name": "chip",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "user",
            "type": "bytes"
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
  }
]