import { getAddress } from '@ethersproject/address'

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.substr(1)

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

export function shortenAddress(address: string, chars = 4): string {
  try {
    const checksummed = getAddress(address)
    return `${checksummed.substring(0, chars + 2)}...${checksummed.substring(42 - chars)}`
  } catch (error) {
    throw Error(`Invalid address "${address}"`)
  }
}
