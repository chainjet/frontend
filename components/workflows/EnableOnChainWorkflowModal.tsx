import { Alert, Button, Input, Modal } from 'antd'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useContractWrite, useNetwork, usePrepareContractWrite, useSigner, useSwitchNetwork } from 'wagmi'
import { Workflow } from '../../graphql'
import { CHAINJET_RUNNER_ABI } from '../../src/abis'
import { CHAINJET_RUNNER_ADDRESS, ZERO_ADDRESS } from '../../src/constants/addresses'
import { ChainId, NETWORK } from '../../src/constants/networks'
import { useRunnerBalance, useRunnerTask } from '../../src/services/RunnerHooks'
import { Loading } from '../common/RequestStates/Loading'

interface Props {
  workflow: Workflow
  onWorkflowEnableChange: (enable: boolean) => any
  onClose: () => any
}

export const EnableOnChainWorkflowModal = ({ workflow, onWorkflowEnableChange, onClose }: Props) => {
  const { chain } = useNetwork()
  const { isLoading: switchNetworkLoading, error: switchNetworkError, switchNetwork } = useSwitchNetwork()
  const { isLoading: signerLoading } = useSigner()
  const [enableLoading, setEnableLoading] = useState(false)
  const [enableError, setEnableError] = useState<Error | null>(null)
  const [depositAmount, setDepositAmount] = useState('0.01')

  const isEnablingWorkflow = !workflow.trigger?.enabled

  const workflowChainId = Number(workflow.network) as ChainId
  const runnerAddress = (workflow.network && CHAINJET_RUNNER_ADDRESS[workflowChainId]) ?? ''

  const {
    task,
    isLoading: taskReadLoading,
    error: taskReadError,
  } = useRunnerTask({ chainId: workflowChainId, address: workflow.address ?? '' })

  const enabledInRunner = task?.addr !== ZERO_ADDRESS
  const taskInCorrectState = !taskReadLoading && isEnablingWorkflow === enabledInRunner

  const { balance, isLoading: balanceLoading } = useRunnerBalance({ chainId: workflowChainId })

  const { config } = usePrepareContractWrite({
    addressOrName: runnerAddress,
    contractInterface: CHAINJET_RUNNER_ABI,
    functionName: isEnablingWorkflow ? 'enableTask' : 'disableTask',
    chainId: workflowChainId,
    args: [workflow.address],
    ...(isEnablingWorkflow && balance?.isZero() && { overrides: { value: ethers.utils.parseEther(depositAmount) } }),
    enabled: !taskInCorrectState,
  })
  const { data, writeAsync } = useContractWrite(config)

  const loading = taskReadLoading || signerLoading || switchNetworkLoading || balanceLoading
  const error = taskReadError || enableError || switchNetworkError
  const networkName = NETWORK[workflowChainId].name

  // if the task is already in the correct state, nothing to do
  useEffect(() => {
    if (taskInCorrectState) {
      onWorkflowEnableChange(isEnablingWorkflow)
    }
  }, [taskInCorrectState, isEnablingWorkflow, onWorkflowEnableChange])

  if (taskInCorrectState) {
    return <></>
  }

  const handleEnableChange = async () => {
    if (isEnablingWorkflow !== enabledInRunner && writeAsync) {
      setEnableLoading(true)
      try {
        await writeAsync()
        onWorkflowEnableChange(isEnablingWorkflow)
      } catch (e) {
        setEnableError(e as Error)
      }
      setEnableLoading(false)
    }
  }

  const nativeSymbol = chain?.testnet ? `${chain.name}${chain?.nativeCurrency?.symbol}` : chain?.nativeCurrency?.symbol

  return (
    <Modal
      title={isEnablingWorkflow ? 'Enable workflow' : 'Disable workflow'}
      open
      onCancel={onClose}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      {error && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Error"
          description={error.message}
          type="error"
          showIcon
          closable
        />
      )}
      {!loading && balance?.isZero() && (
        <>
          <div className="mb-8">
            <Alert
              message={`To enable your first workflow, you need to preload ${nativeSymbol} to pay for the automated transaction gas.`}
            />
          </div>
          <div className="mb-8">
            <div className="mb-2">
              <label htmlFor="deposit-amount">Amount of {nativeSymbol} to deposit:</label>
            </div>
            <Input
              id="deposit-amount"
              placeholder="Amount of ETH to deposit"
              className="w-full"
              value={depositAmount}
              onChange={(e) => Number.isFinite(Number(e.target.value)) && setDepositAmount(e.target.value)}
            />
          </div>
        </>
      )}
      {loading && <Loading />}
      {!loading && workflowChainId !== chain?.id && (
        <>
          <Button type="primary" key="deploy" onClick={() => switchNetwork?.(workflowChainId)}>
            Change network to {networkName}
          </Button>
        </>
      )}
      {!loading && workflowChainId === chain?.id && (
        <>
          <Button type="primary" key="deploy" onClick={() => handleEnableChange()} loading={enableLoading}>
            {isEnablingWorkflow ? 'Enable' : 'Disable'} Workflow
          </Button>
        </>
      )}
    </Modal>
  )
}
