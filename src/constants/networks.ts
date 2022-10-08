export enum ChainId {
  ARBITRUM = 42161,
  ARBITRUM_TESTNET = 79377087078960,
  AURORA = 1313161554,
  AVALANCHE = 43114,
  AVALANCHE_TESTNET = 43113,
  BOBA = 288,
  BSC = 56,
  BSC_TESTNET = 97,
  BTTC = 199,
  CELO = 42220,
  CLV = 1024,
  CRONOS = 25,
  ETHEREUM = 1,
  FANTOM = 250,
  FANTOM_TESTNET = 4002,
  FUSE = 122,
  GNOSIS = 100,
  GOERLI = 5,
  HARMONY = 1666600000,
  HARMONY_TESTNET = 1666700000,
  HECO = 128,
  HECO_TESTNET = 256,
  KOVAN = 42,
  METIS = 1088,
  MOONBEAM = 1284,
  MOONBEAM_TESTNET = 1287,
  MOONRIVER = 1285,
  OKEX = 66,
  OKEX_TESTNET = 65,
  OPTIMISM = 10,
  PALM = 11297108109,
  PALM_TESTNET = 11297108099,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  RINKEBY = 4,
  ROPSTEN = 3,
  SEPOLIA = 11155111,
  TELOS = 40,
}

interface Network {
  name: string
  explorerUrl: string
  etherscanIntegrationKey?: string
  isTestnet?: boolean
}

export const NETWORK: { [key in ChainId]: Network } = {
  [ChainId.ARBITRUM]: {
    name: 'Arbitrum',
    explorerUrl: 'https://arbiscan.io',
    etherscanIntegrationKey: 'arbiscan',
  },
  [ChainId.ARBITRUM_TESTNET]: {
    name: 'Arbitrum Testnet',
    explorerUrl: 'https://rinkeby-explorer.arbitrum.io',
    isTestnet: true,
  },
  [ChainId.AURORA]: {
    name: 'Aurora',
    explorerUrl: 'https://aurorascan.dev',
    etherscanIntegrationKey: 'aurorascan',
  },
  [ChainId.AVALANCHE]: {
    name: 'Avalanche',
    explorerUrl: 'https://snowtrace.io',
    etherscanIntegrationKey: 'snowtrace',
  },
  [ChainId.AVALANCHE_TESTNET]: {
    name: 'Avalanche Testnet',
    explorerUrl: 'https://testnet.snowtrace.io',
    isTestnet: true,
  },
  [ChainId.BOBA]: {
    name: 'Boba Network',
    explorerUrl: 'https://bobascan.com',
    etherscanIntegrationKey: 'bobascan',
  },
  [ChainId.BSC]: {
    name: 'BNB Chain (BSC)',
    explorerUrl: 'https://bscscan.com',
    etherscanIntegrationKey: 'bscscan',
  },
  [ChainId.BSC_TESTNET]: {
    name: 'BSC Testnet',
    explorerUrl: 'https://testnet.bscscan.com',
    isTestnet: true,
  },
  [ChainId.BTTC]: {
    name: 'BitTorrent Chain',
    explorerUrl: 'https://bttcscan.com',
    etherscanIntegrationKey: 'bttcscan',
  },
  [ChainId.CELO]: {
    name: 'Celo',
    explorerUrl: 'https://celoscan.io',
    etherscanIntegrationKey: 'celoscan',
  },
  [ChainId.CLV]: {
    name: 'CLV Chain',
    explorerUrl: 'https://clvscan.com',
    etherscanIntegrationKey: 'clvscan',
  },
  [ChainId.CRONOS]: {
    name: 'Cronos',
    explorerUrl: 'https://cronoscan.com',
    etherscanIntegrationKey: 'cronoscan',
  },
  [ChainId.ETHEREUM]: {
    name: 'Ethereum',
    explorerUrl: 'https://etherscan.io',
    etherscanIntegrationKey: 'etherscan',
  },
  [ChainId.FANTOM]: {
    name: 'Fantom',
    explorerUrl: 'https://ftmscan.com',
    etherscanIntegrationKey: 'ftmscan',
  },
  [ChainId.FANTOM_TESTNET]: {
    name: 'Fantom Testnet',
    explorerUrl: 'https://testnet.ftmscan.com',
    isTestnet: true,
  },
  [ChainId.FUSE]: {
    name: 'Fuse',
    explorerUrl: 'https://explorer.fuse.io',
  },
  [ChainId.GNOSIS]: {
    name: 'Gnosis',
    explorerUrl: 'https://gnosisscan.io',
    etherscanIntegrationKey: 'gnosisscan',
  },
  [ChainId.GOERLI]: {
    name: 'Görli',
    explorerUrl: 'https://goerli.etherscan.io',
    isTestnet: true,
  },
  [ChainId.HARMONY]: {
    name: 'Harmony',
    explorerUrl: 'https://explorer.harmony.one',
  },
  [ChainId.HARMONY_TESTNET]: {
    name: 'Harmony Testnet',
    explorerUrl: 'https://explorer.pops.one',
    isTestnet: true,
  },
  [ChainId.HECO]: {
    name: 'Heco',
    explorerUrl: 'https://hecoinfo.com',
  },
  [ChainId.HECO_TESTNET]: {
    name: 'Heco Testnet',
    explorerUrl: 'https://testnet.hecoinfo.com',
    isTestnet: true,
  },
  [ChainId.KOVAN]: {
    name: 'Kovan',
    explorerUrl: 'https://kovan.etherscan.io',
    isTestnet: true,
  },
  [ChainId.MOONBEAM]: {
    name: 'Moonbeam',
    explorerUrl: 'https://moonbeam.moonscan.io',
    etherscanIntegrationKey: 'moonbeam-moonscan',
  },
  [ChainId.MOONBEAM_TESTNET]: {
    name: 'Moonbeam Testnet',
    explorerUrl: 'https://moonbase.moonscan.io',
    isTestnet: true,
  },
  [ChainId.MOONRIVER]: {
    name: 'Moonriver',
    explorerUrl: 'https://moonriver.moonscan.io',
    etherscanIntegrationKey: 'moonriver-moonscan',
  },
  [ChainId.METIS]: {
    name: 'Metis',
    explorerUrl: 'https://explorer.metis.io',
  },
  [ChainId.OKEX]: {
    name: 'OKExChain',
    explorerUrl: 'https://www.oklink.com/okc/',
  },
  [ChainId.OKEX_TESTNET]: {
    name: 'OKExChain Testnet',
    explorerUrl: 'https://www.oklink.com/okexchain-testnet',
    isTestnet: true,
  },
  [ChainId.OPTIMISM]: {
    name: 'Optimism',
    explorerUrl: 'https://optimistic.etherscan.io',
    etherscanIntegrationKey: 'optimistic-etherscan',
  },
  [ChainId.PALM]: {
    name: 'Palm',
    explorerUrl: 'https://explorer.palm.io',
  },
  [ChainId.PALM_TESTNET]: {
    name: 'Palm Testnet',
    explorerUrl: 'https://testnet-explorer.palm.io',
    isTestnet: true,
  },
  [ChainId.POLYGON]: {
    name: 'Polygon',
    explorerUrl: 'https://polygonscan.com',
    etherscanIntegrationKey: 'polygonscan',
  },
  [ChainId.POLYGON_MUMBAI]: {
    name: 'Polygon Testnet',
    explorerUrl: 'https://mumbai.polygonscan.com',
    isTestnet: true,
  },
  [ChainId.RINKEBY]: {
    name: 'Rinkeby',
    explorerUrl: 'https://rinkeby.etherscan.io',
    isTestnet: true,
  },
  [ChainId.ROPSTEN]: {
    name: 'Ropsten',
    explorerUrl: 'https://ropsten.etherscan.io',
    isTestnet: true,
  },
  [ChainId.SEPOLIA]: {
    name: 'Sepolia',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
  [ChainId.TELOS]: {
    name: 'Telos',
    explorerUrl: 'https://explorer.teloscoin.org',
  },
}
