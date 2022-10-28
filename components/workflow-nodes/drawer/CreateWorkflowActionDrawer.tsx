import { IntegrationAction, WorkflowAction } from '../../../graphql'
import { useCreateOneWorkflowAction, useTestWorkflowAction } from '../../../src/services/WorkflowActionHooks'
import { WorkflowNodeDrawer } from './WorkflowNodeDrawer'

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

export const CreateWorkflowActionDrawer = ({
  workflowId,
  workflowTriggerId,
  parentActionIds,
  previousActionCondition,
  nextAction,
  visible,
  onCreateWorkflowAction,
  onCancel,
}: Props) => {
  const [createOneWorkflowAction] = useCreateOneWorkflowAction()
  const [testWorkflowAction] = useTestWorkflowAction()

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
          },
        },
      },
    })
    if (res.data?.createOneWorkflowAction) {
      // TODO show error and show UpdateWorkflowActionDrawer
      await testWorkflowAction({
        variables: {
          id: res.data.createOneWorkflowAction.id,
        },
      })
      onCreateWorkflowAction(res.data.createOneWorkflowAction)
    } else {
      // TODO display error
    }
  }

  return (
    <WorkflowNodeDrawer
      nodeType="action"
      title="Create Workflow Action"
      visible={visible}
      action="create"
      workflowTriggerId={workflowTriggerId}
      parentActionIds={parentActionIds}
      onSubmitInputs={onSubmitInputs}
      onCancel={onCancel}
    />
  )
}
