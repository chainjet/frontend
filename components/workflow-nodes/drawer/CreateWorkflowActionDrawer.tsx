import React from 'react'
import { WorkflowNodeDrawer } from './WorkflowNodeDrawer'
import { IntegrationAction, WorkflowAction } from '../../../graphql'
import { useCreateOneWorkflowAction } from '../../../src/services/WorkflowActionHooks'

interface Props {
  visible: boolean
  workflowId: string
  workflowTriggerId: string | undefined
  parentActionIds: string[]
  previousActionCondition?: string
  nextAction?: string
  onCreateWorkflowAction: (workflowAction: WorkflowAction) => void
  onCancel: () => void
}

export const CreateWorkflowActionDrawer = (props: Props) => {
  const {
    workflowId,
    workflowTriggerId,
    parentActionIds,
    previousActionCondition,
    nextAction,
    visible,
    onCreateWorkflowAction,
    onCancel
  } = props
  const [createOneWorkflowAction] = useCreateOneWorkflowAction()

  const onSubmitInputs = async (inputs: { [key: string]: any }, action: IntegrationAction, credentialsID?: string) => {
    const previousAction = parentActionIds.length ? parentActionIds[parentActionIds.length - 1] : undefined
    const res = await createOneWorkflowAction({
      variables: {
        input: {
          workflowAction: {
            workflow: workflowId,
            integrationAction: action.id,
            inputs,
            previousAction,
            previousActionCondition,
            nextAction,
            credentials: credentialsID,
          }
        }
      }
    })
    if (res.data?.createOneWorkflowAction) {
      onCreateWorkflowAction(res.data.createOneWorkflowAction)
    } else {
      // TODO display error
    }
  }

  return (
    <WorkflowNodeDrawer nodeType="action"
                        title="Create Workflow Action"
                        visible={visible}
                        workflowTriggerId={workflowTriggerId}
                        parentActionIds={parentActionIds}
                        onSubmitInputs={onSubmitInputs}
                        onCancel={onCancel}/>
  )
}
