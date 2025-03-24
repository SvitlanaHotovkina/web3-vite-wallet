// src/constants/networks.ts

export const NETWORKS = [
  { name: "Sepolia", rpcUrl: "https://rpc.sepolia.org" },
  { name: "Goerli", rpcUrl: "https://rpc.ankr.com/eth_goerli" },
  { name: "Polygon Mumbai", rpcUrl: "https://rpc-mumbai.maticvigil.com" },
  { name: "BSC Mainnet", rpcUrl: "https://bsc-dataseed.binance.org/" },
  {
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  {
    name: "Polygon zkEVM Testnet-1442",
    rpcUrl: "https://rpc.public.zkevm-test.net",
  },
  {
    name: "Polygon Amoy Testnet-80002",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
];

export const KNOWN_TOKENS: Record<
  string,
  { symbol: string; address: string }[]
> = {
  sepolia: [
    { symbol: "USDC", address: "0x6C3EA9036406852006290770BEdFcAbA0e23A0aD" },
    { symbol: "DAI", address: "0x0000000000000000000000000000000000000000" },
  ],
  goerli: [
    { symbol: "USDT", address: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9" },
  ],
  bnb: [
    { symbol: "BUSD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56" },
  ],
  bnbt: [
    { symbol: "BUSD", address: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47" },
  ],
  mumbai: [
    { symbol: "USDC", address: "0x2058A9d7613eee744279e3856Ef0eada5FCbaA54" },
  ],
  amoy: [
    { symbol: "tUSDC", address: "0xE51E2b5d261cA2E432A30154fF94Fb282F9A64f4" },
  ],
  zkevm: [
    { symbol: "zUSDC", address: "0x53fECa167DdA6F2dE2eAEE7025C57A5aC92C96a2" },
  ],
};
