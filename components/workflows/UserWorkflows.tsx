import { gql } from '@apollo/client'
import { SortDirection, WorkflowSortFields } from '../../graphql'
import { useGetWorkflows } from '../../src/services/WorkflowHooks'
import { Loading } from '../common/RequestStates/Loading'
import { RequestError } from '../common/RequestStates/RequestError'
import { WorkflowsTable } from './WorkflowsTable'

const workflowsFragment = gql`
  fragment UserWorkflowsFragment on Workflow {
    ...WorkflowsTable_Workflow
  }
  ${WorkflowsTable.fragments.Workflow}
`

export const UserWorkflows = () => {
  const { data, loading, error } = useGetWorkflows(workflowsFragment, {
    variables: {
      paging: {
        first: 120,
      },
      sorting: [
        {
          field: WorkflowSortFields.createdAt,
          direction: SortDirection.DESC,
        },
      ],
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflows) {
    return <RequestError error={error} />
  }

  const workflows = data.workflows.edges.map((edge) => edge.node)

  return <WorkflowsTable workflows={workflows} />
}
