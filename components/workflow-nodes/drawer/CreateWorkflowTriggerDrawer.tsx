import React, { useState } from 'react'
import { WorkflowNodeDrawer } from './WorkflowNodeDrawer'
import { IntegrationTrigger, WorkflowTrigger } from '../../../graphql'
import { useCreateOneWorkflowTrigger } from '../../../src/services/WorkflowTriggerHooks'
import { CompleteHookTrigger } from './steps/CompleteHookTrigger'

interface Props {
  workflowId: string
  visible: boolean
  onCreateWorkflowTrigger: (workflowTrigger: WorkflowTrigger) => void
  onCancel: () => void
}

export const CreateWorkflowTriggerDrawer = (props: Props) => {
  const { workflowId, visible, onCreateWorkflowTrigger, onCancel } = props
  const [createWorkflowTrigger] = useCreateOneWorkflowTrigger()
  const [hookStep, setHookStep] = useState(false)
  const [integrationTrigger, setIntegrationTrigger] = useState<IntegrationTrigger | null>(null)
  const [workflowTrigger, setWorkflowTrigger] = useState<WorkflowTrigger | null>(null)

  const onSubmitInputs = async (
    inputs: Record<string, any>,
    integrationTrigger: IntegrationTrigger,
    credentialsID?: string
  ) => {
    const schedule = inputs.chainjet_schedule
    delete inputs.chainjet_schedule
    const res = await createWorkflowTrigger({
      variables: {
        input: {
          workflowTrigger: {
            workflow: workflowId,
            integrationTrigger: integrationTrigger.id,
            inputs,
            credentials: credentialsID,
            schedule
          },
        }
      }
    })
    setIntegrationTrigger(integrationTrigger)
    if (res.data?.createOneWorkflowTrigger) {
      setWorkflowTrigger(res.data?.createOneWorkflowTrigger)
      if (res.data.createOneWorkflowTrigger.hookId) {
        setHookStep(true)
      } else {
        onCreateWorkflowTrigger(res.data.createOneWorkflowTrigger)
      }
    }
  }

  const handleCancel = () => {
    // if the workflow trigger was updated and the drawer is opened on the override step, complete on cancel
    if (workflowTrigger) {
      onCreateWorkflowTrigger(workflowTrigger)
    } else {
      onCancel()
    }
  }

  const handleCompleteHooKTrigger = () => {
    if (workflowTrigger) {
      onCreateWorkflowTrigger(workflowTrigger)
    }
  }

  return (
    <WorkflowNodeDrawer nodeType="trigger"
      title="Create Workflow Trigger"
      visible={visible}
      overrideStep={
        integrationTrigger && workflowTrigger && hookStep
          ? <CompleteHookTrigger
            integrationTrigger={integrationTrigger}
            workflowTrigger={workflowTrigger}
            onClose={handleCompleteHooKTrigger} />
          : undefined
      }
      onSubmitInputs={onSubmitInputs}
      onCancel={handleCancel} />
  )
}
