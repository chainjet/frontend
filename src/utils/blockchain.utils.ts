import { JSONSchema7 } from 'json-schema'
import { NETWORK } from '../constants/networks'

export function getExplorerUrlForIntegration(key: string) {
  const network = Object.values(NETWORK).find((network) => network.etherscanIntegrationKey === key)
  return network?.explorerUrl
}

export function getEtherscanNetworkSchema(): JSONSchema7 {
  return {
    title: 'Network',
    type: 'string',
    default: 'etherscan',
    oneOf: [
      ...Object.values(NETWORK)
        .filter((network) => !!network.etherscanIntegrationKey)
        .map((network) => ({
          title: network.name,
          const: network.etherscanIntegrationKey,
        })),
    ],
  }
}
