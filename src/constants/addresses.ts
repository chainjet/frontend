import { ChainId } from './networks'

export const CHAINJET_RUNNER_ADDRESS: { [key in ChainId]?: string } = {
  [ChainId.GOERLI]: '0x3E7b48961ff116A4e39b22d01d2B990522960215',
}
