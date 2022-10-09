import { ChainId } from './networks'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const CHAINJET_RUNNER_ADDRESS: { [key in ChainId]?: string } = {
  [ChainId.GOERLI]: '0x3E7b48961ff116A4e39b22d01d2B990522960215',
}
