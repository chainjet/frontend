import { JSONSchema7 } from 'json-schema'

export function getExplorerUrlForIntegration(key: string) {
  switch (key) {
    case 'etherscan':
      return 'https://etherscan.io'
    case 'arbiscan':
      return 'https://arbiscan.io'
    case 'aurorascan':
      return 'https://aurorascan.dev'
    case 'snowtrace':
      return 'https://snowtrace.io'
    case 'bscscan':
      return 'https://bscscan.com'
    case 'bobascan':
      return 'https://bobascan.io'
    case 'bttcscan':
      return 'https://bttcscan.com'
    case 'celoscan':
      return 'https://celoscan.io'
    case 'clvscan':
      return 'https://clvscan.com'
    case 'cronoscan':
      return 'https://cronoscan.com'
    case 'ftmscan':
      return 'https://ftmscan.com'
    case 'gnosisscan':
      return 'https://gnosisscan.io'
    case 'moonbeam-moonscan':
      return 'https://moonbeam.moonscan.io'
    case 'moonriver-moonscan':
      return 'https://moonriver.moonscan.io'
    case 'optimistic-etherscan':
      return 'https://optimistic.etherscan.io'
    case 'polygonscan':
      return 'https://polygonscan.com'
  }
  return ''
}

export function getEtherscanNetworkSchema(): JSONSchema7 {
  return {
    title: 'Network',
    type: 'string',
    default: 'etherscan',
    oneOf: [
      { title: 'Ethereum', const: 'etherscan' },
      { title: 'Arbitrum', const: 'arbiscan' },
      { title: 'Aurora', const: 'aurorascan' },
      { title: 'Avalanche', const: 'snowtrace' },
      { title: 'BNB Chain (BSC)', const: 'bscscan' },
      { title: 'Boba Network', const: 'bobascan' },
      { title: 'BitTorrent', const: 'bttcscan' },
      { title: 'Celo', const: 'celoscan' },
      { title: 'CLV Chain', const: 'clvscan' },
      { title: 'Cronos', const: 'cronoscan' },
      { title: 'Fantom', const: 'ftmscan' },
      { title: 'Gnosis', const: 'gnosisscan' },
      { title: 'Moonbeam', const: 'moonbeam-moonscan' },
      { title: 'Moonriver', const: 'moonriver-moonscan' },
      { title: 'Optimism', const: 'optimistic-etherscan' },
      { title: 'Polygon', const: 'polygonscan' },
    ],
  }
}
