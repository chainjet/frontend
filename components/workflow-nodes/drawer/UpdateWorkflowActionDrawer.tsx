import React from 'react'
import { WorkflowNodeDrawer } from './WorkflowNodeDrawer'
import { Loading } from '../../common/RequestStates/Loading'
import { RequestError } from '../../common/RequestStates/RequestError'
import { SelectWorkflowNode } from './steps/SelectWorkflowNode'
import { gql } from '@apollo/client'
import { IntegrationAction, WorkflowAction } from '../../../graphql'
import { useGetWorkflowActionById, useUpdateOneWorkflowAction } from '../../../src/services/WorkflowActionHooks'

interface Props {
  visible: boolean
  workflowActionId: string
  workflowTriggerId: string | undefined
  parentActionIds: string[]
  onUpdateWorkflowAction: (workflowAction: WorkflowAction) => void
  onCancel: () => void
}

const workflowActionFragment = gql`
  fragment UpdateWorkflowActionDrawer on WorkflowAction {
    id
    name
    inputs
    integrationAction {
      id
      name
      integration {
        name
      }
      ...SelectWorkflowNode_IntegrationAction
    }
    credentials {
      id
    }
  }
  ${SelectWorkflowNode.fragments.IntegrationAction}
`

export const UpdateWorkflowActionDrawer = (props: Props) => {
  const { visible, workflowTriggerId, parentActionIds, onUpdateWorkflowAction, onCancel } = props
  const [updateWorkflowAction] = useUpdateOneWorkflowAction()
  const { data, loading, error } = useGetWorkflowActionById(workflowActionFragment, {
    variables: {
      id: props.workflowActionId,
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflowAction) {
    return <RequestError error={error} />
  }

  const workflowAction = data.workflowAction

  const onSubmitInputs = async (inputs: { [key: string]: any }, _action: IntegrationAction, credentialsID?: string) => {
    const name = inputs.chainjet_operation_name
    delete inputs.chainjet_operation_name
    await updateWorkflowAction({
      variables: {
        input: {
          id: workflowAction.id,
          update: {
            name,
            inputs,
            ...(credentialsID ? { credentials: credentialsID } : {}),
          },
        },
      },
    })
    onUpdateWorkflowAction(workflowAction)
  }

  const initialInputs = {
    ...(workflowAction.inputs ?? {}),
    chainjet_operation_name: workflowAction.name,
  }

  return (
    <WorkflowNodeDrawer
      nodeType="action"
      visible={visible}
      title={`Update Action "${workflowAction.name}"`}
      workflowTriggerId={workflowTriggerId}
      parentActionIds={parentActionIds}
      initialNode={workflowAction.integrationAction}
      initialNodeInputs={initialInputs}
      initialCredentialId={workflowAction.credentials?.id}
      extraSchemaProps={{
        required: ['chainjet_operation_name'],
        properties: {
          chainjet_operation_name: {
            title: 'Display name',
            type: 'string',
            description: 'Operation name to use on the flow chart and logs.',
          },
        },
      }}
      onSubmitInputs={onSubmitInputs}
      onCancel={onCancel}
    />
  )
}
