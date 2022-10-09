import { Switch } from 'antd'
import { useCallback, useState } from 'react'
import { Workflow } from '../../graphql'
import { useUpdateOneWorkflowTrigger } from '../../src/services/WorkflowTriggerHooks'
import { EnableOnChainWorkflowModal } from './EnableOnChainWorkflowModal'

interface Props {
  workflow: Workflow
  onWorkflowEnableChange?: (enabled: boolean) => any
}

export function EnableWorkflowSwitch({ workflow, onWorkflowEnableChange }: Props) {
  const [changingWorkflowTriggerEnable, setChangingWorkflowTriggerEnable] = useState(false)
  const [enableOnChainWorkflowModalOpen, setEnableOnChainWorkflowModalOpen] = useState(false)
  const [enablingError, setEnablingError] = useState<Error | null>(null)
  const [updateWorkflowTrigger] = useUpdateOneWorkflowTrigger()

  const setWorkflowEnable = useCallback(
    async (enabled: boolean) => {
      if (!workflow.trigger) {
        return
      }
      setChangingWorkflowTriggerEnable(true)
      try {
        await updateWorkflowTrigger({
          variables: {
            input: {
              id: workflow.trigger.id,
              update: {
                enabled,
              },
            },
          },
        })
        onWorkflowEnableChange?.(enabled)
      } catch (e) {
        setEnablingError(e as Error)
      }
      setChangingWorkflowTriggerEnable(false)
    },
    [onWorkflowEnableChange, updateWorkflowTrigger, workflow.trigger],
  )

  const handleEnableClick = useCallback(
    async (enabled: boolean) => {
      if (!workflow.trigger) {
        return
      }
      if (workflow.network) {
        setChangingWorkflowTriggerEnable(true)
        setEnableOnChainWorkflowModalOpen(true)
        return
      }
      await setWorkflowEnable(enabled)
    },
    [setWorkflowEnable, workflow.network, workflow.trigger],
  )

  const handleOnChainWorkflowEnableChange = useCallback(
    async (enable: boolean) => {
      setEnableOnChainWorkflowModalOpen(false)
      await setWorkflowEnable(enable)
    },
    [setWorkflowEnable],
  )

  const handleOnChainWorkflowModalClose = useCallback(() => {
    setEnableOnChainWorkflowModalOpen(false)
    setChangingWorkflowTriggerEnable(false)
  }, [])

  if (!workflow.trigger) {
    return <></>
  }

  return (
    <>
      <Switch
        key="enable"
        checkedChildren="On"
        unCheckedChildren="Off"
        loading={changingWorkflowTriggerEnable}
        checked={workflow.trigger.enabled}
        onClick={handleEnableClick}
      />
      {enableOnChainWorkflowModalOpen && (
        <EnableOnChainWorkflowModal
          workflow={workflow}
          onWorkflowEnableChange={handleOnChainWorkflowEnableChange}
          onClose={handleOnChainWorkflowModalClose}
        />
      )}
    </>
  )
}
