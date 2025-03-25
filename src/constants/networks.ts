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
  { symbol: string; address: string; router: string; abi: string[] }[]
> = {
  sepolia: [
    {
      symbol: "USDC",
      address: "0x6C3EA9036406852006290770BEdFcAbA0e23A0aD",
      router: "",
      abi: [],
    },
    {
      symbol: "DAI",
      address: "0x0000000000000000000000000000000000000000",
      router: "",
      abi: [],
    },
  ],
  goerli: [
    {
      symbol: "USDT",
      address: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
      router: "",
      abi: [],
    },
  ],
  bnb: [
    {
      symbol: "BUSD",
      address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      router: "",
      abi: [],
    },
  ],
  bnbt: [
    {
      symbol: "BUSD",
      address: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
      router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
      abi: [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
    },
    {
      symbol: "WBNB",
      address: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
      router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
      abi: [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
    },
    {
      symbol: "USDC",
      address: "0x64544969ed7EBf5f083679233325356EbE738930",
      router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
      abi: [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
    },
    {
      // used only for swap
      symbol: "tBNB",
      address: "0xae13d989dac2f0debff460ac112a837c89baa7cd", // це WBNB на BNB Testnet
      router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1", // PancakeSwap Testnet
      abi: [
        "function deposit() public payable",
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
    },
  ],
  mumbai: [
    {
      symbol: "USDC",
      address: "0x2058A9d7613eee744279e3856Ef0eada5FCbaA54",
      router: "",
      abi: [],
    },
  ],
  amoy: [
    {
      symbol: "tUSDC",
      address: "0xE51E2b5d261cA2E432A30154fF94Fb282F9A64f4",
      router: "",
      abi: [],
    },
  ],
  zkevm: [
    {
      symbol: "zUSDC",
      address: "0x53fECa167DdA6F2dE2eAEE7025C57A5aC92C96a2",
      router: "",
      abi: [],
    },
  ],
};
