import { BigNumber } from 'ethers'
import { useAccount, useContractRead } from 'wagmi'
import { CHAINJET_RUNNER_ABI } from '../abis'
import { CHAINJET_RUNNER_ADDRESS } from '../constants/addresses'
import { ChainId } from '../constants/networks'

export function useRunnerTask({ chainId, address }: { chainId: ChainId; address: string }) {
  const res = useContractRead({
    addressOrName: CHAINJET_RUNNER_ADDRESS[chainId] ?? '',
    contractInterface: CHAINJET_RUNNER_ABI,
    functionName: 'tasks',
    enabled: !!address,
    args: address,
    chainId,
  })
  return {
    ...res,
    task: res.data as { addr: string; owner: string } | undefined,
  }
}

export function useRunnerBalance({ chainId }: { chainId: ChainId }) {
  const { address } = useAccount()
  const res = useContractRead({
    addressOrName: CHAINJET_RUNNER_ADDRESS[chainId] ?? '',
    contractInterface: CHAINJET_RUNNER_ABI,
    functionName: 'balances',
    enabled: true,
    args: [address],
    chainId,
  })
  return {
    ...res,
    balance: res.data as BigNumber | undefined,
  }
}
