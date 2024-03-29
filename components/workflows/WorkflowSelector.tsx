import { gql } from '@apollo/client'
import { Select } from 'antd'
import { Workflow } from '../../graphql'
import { useGetWorkflows } from '../../src/services/WorkflowHooks'
import { Loading } from '../common/RequestStates/Loading'
import { RequestError } from '../common/RequestStates/RequestError'

const workflowsFragment = gql`
  fragment WorkflowSelectorFragment on Workflow {
    id
    name
  }
`

interface Props {
  selectedWorkflowId?: string
  onChange: (workflowId: string) => void
  filterWorkflows?: (workflow: Workflow) => boolean
}

export function WorkflowSelector({ selectedWorkflowId, onChange, filterWorkflows }: Props) {
  const { data, loading, error } = useGetWorkflows(workflowsFragment, {
    variables: {
      paging: {
        first: 120,
      },
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflows) {
    return <RequestError error={error} />
  }

  const workflows = data.workflows.edges
    .map((workflow) => workflow.node)
    .filter((workflow) => (filterWorkflows ? filterWorkflows(workflow) : true))

  return (
    <Select
      defaultValue={selectedWorkflowId}
      placeholder="Select workflow to run"
      onChange={onChange}
      style={{ width: '100%' }}
    >
      {workflows.map((workflow) => (
        <Select.Option key={workflow.id} value={workflow.id}>
          {workflow.name}
        </Select.Option>
      ))}
    </Select>
  )
}
