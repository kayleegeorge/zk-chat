export const RLN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
export const RLN_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "membershipDeposit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "depth",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_poseidonHasher",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "memPubkey",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "MemberRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "memPubkey",
        "type": "uint256"
      }
    ],
    "name": "MemberWithdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEPTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MEMBERSHIP_DEPOSIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SET_SIZE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "memPubkeyIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "members",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poseidonHasher",
    "outputs": [
      {
        "internalType": "contract IPoseidonHasher",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "memPubkey",
        "type": "uint256"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "memPubkeys",
        "type": "uint256[]"
      }
    ],
    "name": "registerBatch",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "secret",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "secrets",
        "type": "uint256[]"
      },
      {
        "internalType": "address payable[]",
        "name": "receivers",
        "type": "address[]"
      }
    ],
    "name": "withdrawBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]