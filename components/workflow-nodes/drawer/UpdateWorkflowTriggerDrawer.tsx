import { gql } from '@apollo/client'
import { IntegrationTrigger, WorkflowTrigger } from '../../../graphql'
import { useGetWorkflowTriggerById, useUpdateOneWorkflowTrigger } from '../../../src/services/WorkflowTriggerHooks'
import { Loading } from '../../common/RequestStates/Loading'
import { RequestError } from '../../common/RequestStates/RequestError'
import { SelectWorkflowNode } from './steps/SelectWorkflowNode'
import { WorkflowNodeDrawer } from './WorkflowNodeDrawer'

interface Props {
  workflowTriggerId: string
  visible: boolean
  onUpdateWorkflowTrigger: (workflowTrigger: WorkflowTrigger) => void
  onCancel: () => void
}

const workflowTriggerFragment = gql`
  fragment UpdateWorkflowTriggerDrawerFragment on WorkflowTrigger {
    id
    name
    inputs
    schedule
    integrationTrigger {
      id
      name
      integration {
        name
      }
      ...SelectWorkflowNode_IntegrationTrigger
    }
    credentials {
      id
    }
  }
  ${SelectWorkflowNode.fragments.IntegrationTrigger}
`

export const UpdateWorkflowTriggerDrawer = ({
  workflowTriggerId,
  visible,
  onUpdateWorkflowTrigger,
  onCancel,
}: Props) => {
  const [updateWorkflowTrigger] = useUpdateOneWorkflowTrigger()
  const { data, loading, error } = useGetWorkflowTriggerById(workflowTriggerFragment, {
    variables: {
      id: workflowTriggerId,
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflowTrigger) {
    return <RequestError error={error} />
  }

  const workflowTrigger = data.workflowTrigger

  const onSubmitInputs = async (inputs: Record<string, any>, _: IntegrationTrigger, credentialsID?: string) => {
    const name = inputs.chainjet_operation_name
    const schedule = inputs.chainjet_schedule
    delete inputs.chainjet_operation_name
    delete inputs.chainjet_schedule
    await updateWorkflowTrigger({
      variables: {
        input: {
          id: workflowTrigger.id,
          update: {
            name,
            inputs,
            ...(credentialsID ? { credentials: credentialsID } : {}),
            schedule,
          },
        },
      },
    })
    onUpdateWorkflowTrigger(workflowTrigger)
  }

  const initialInputs = {
    ...(workflowTrigger.inputs ?? {}),
    chainjet_schedule: workflowTrigger.schedule,
    chainjet_operation_name: workflowTrigger.name,
  }

  return (
    <WorkflowNodeDrawer
      nodeType="trigger"
      title={`Update Trigger "${workflowTrigger.name}"`}
      action="update"
      initialNode={workflowTrigger.integrationTrigger}
      initialNodeInputs={initialInputs ?? {}}
      initialCredentialId={workflowTrigger.credentials?.id}
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
      visible={visible}
      onSubmitInputs={onSubmitInputs}
      onCancel={onCancel}
    />
  )
}
