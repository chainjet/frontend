import { isAddress } from '@ethersproject/address'
import { Alert, Button, Modal } from 'antd'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import { Workflow } from '../../graphql'
import { CHAINJET_RUNNER_ADDRESS } from '../../src/constants/addresses'
import { ChainId, NETWORK } from '../../src/constants/networks'
import { useCompileWorkflow, useUpdateOneWorkflow } from '../../src/services/WorkflowHooks'
import { Loading } from '../common/RequestStates/Loading'

interface Props {
  workflow: Workflow
  visible: boolean
  onWorkflowDeploy: (name: string) => any
  onClose: () => any
}

export const DeployWorkflowModal = ({ workflow, visible, onWorkflowDeploy, onClose }: Props) => {
  const {
    data,
    loading: compileDataLoading,
    error: compileDataError,
  } = useCompileWorkflow({
    skip: !visible || !workflow,
    variables: {
      workflowId: workflow?.id,
    },
  })
  const { chain } = useNetwork()
  const { isLoading: switchNetworkLoading, error: switchNetworkError, switchNetwork } = useSwitchNetwork()
  const { data: signer, isLoading } = useSigner()
  const [deployLoading, setDeployLoading] = useState(false)
  const [deployError, setDeployError] = useState<Error | null>(null)
  const [updateWorkflow] = useUpdateOneWorkflow()

  const bytecode = data?.compileWorkflow.bytecode
  const abi = data?.compileWorkflow.abi
  const sourcecode = data?.compileWorkflow.sourcecode

  const workflowChainId = Number(workflow.network) as ChainId
  const loading = compileDataLoading || isLoading || switchNetworkLoading
  const error = compileDataError || switchNetworkError || deployError
  const networkName = NETWORK[workflowChainId].name

  const handleDeploy = async () => {
    if (!abi || !bytecode || !signer) {
      return
    }
    setDeployLoading(true)
    const contract = new ethers.ContractFactory(abi, bytecode, signer)
    try {
      const res = await contract.deploy(CHAINJET_RUNNER_ADDRESS[workflowChainId])
      if (res?.address && isAddress(res.address)) {
        await updateWorkflow({
          variables: {
            input: {
              id: workflow.id,
              update: {
                address: res.address,
              },
            },
          },
        })
        onWorkflowDeploy(res.address)
      } else {
        setDeployError(new Error('Unknown error deploying the contract. Please try again.'))
      }
    } catch (e) {
      setDeployError(e as Error)
    }
    setDeployLoading(false)
  }

  return (
    <Modal
      title={`Deploy Workflow to ${networkName}`}
      visible={visible}
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
          onClose={() => setDeployError(null)}
        />
      )}
      {!error && (
        <div className="mb-8">
          <Alert type="success" message="Great news! Your contract is ready to be deployed." />
        </div>
      )}
      {loading && <Loading />}
      {!loading && workflowChainId !== chain?.id && (
        <>
          <Button type="primary" key="deploy" onClick={() => switchNetwork?.(workflowChainId)}>
            Change network to {networkName}
          </Button>
        </>
      )}
      {!loading && bytecode && abi && workflowChainId === chain?.id && (
        <>
          <Button type="primary" key="deploy" onClick={() => handleDeploy()} loading={deployLoading}>
            Deploy to {networkName}
          </Button>
        </>
      )}
    </Modal>
  )
}
