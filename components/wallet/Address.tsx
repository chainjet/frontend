import { Address as AddressType, useEnsName } from 'wagmi'
import { shortenAddress } from '../../src/utils/strings'

interface Props {
  address: string
}

export function Address({ address }: Props) {
  const { data: ensName } = useEnsName({ address: address.toLowerCase() as AddressType })
  return <>{ensName || shortenAddress(address)}</>
}
