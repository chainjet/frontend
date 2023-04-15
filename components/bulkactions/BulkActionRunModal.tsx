import { gql } from '@apollo/client'
import { Modal, Progress } from 'antd'
import { useMemo } from 'react'
import { SortDirection, Workflow, WorkflowRunSortFields } from '../../graphql'
import { useGetWorkflowRuns } from '../../src/services/WorkflowRunHooks'
import { Loading } from '../common/RequestStates/Loading'

interface Props {
  open?: boolean
  workflow: Workflow
  onContinue?: () => any
  onCancel: () => any
}

const workflowRunFragment = gql`
  fragment BulkActionRunModal_WorkflowRun on WorkflowRun {
    id
    status
    createdAt
    triggerRun {
      workflowTriggered
    }
    totalItems
    itemsProcessed
    operationsUsed
  }
`

export const BulkActionRunModal = ({ open = true, workflow, onContinue, onCancel }: Props) => {
  const { data, loading, error, refetch } = useGetWorkflowRuns(workflowRunFragment, {
    skip: !open,
    pollInterval: 5000,
    variables: {
      filter: {
        workflow: {
          eq: workflow.id,
        },
      },
      paging: {
        first: 1,
      },
      sorting: [
        {
          field: 'createdAt' as WorkflowRunSortFields,
          direction: SortDirection.ASC,
        },
      ],
    },
  })
  const workflowRun = useMemo(
    () => data?.workflowRuns?.edges?.map((edge) => edge?.node)?.[0],
    [data?.workflowRuns?.edges],
  )

  return (
    <Modal
      title="Bulk Action Run"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={Math.min(window.innerWidth, 650)}
    >
      <div className="text-center">
        {loading && <Loading />}
        {workflowRun && (
          <>
            <div className="mb-8">
              The action was executed for <strong>{workflowRun.itemsProcessed}</strong> items from a total of{' '}
              <strong>{workflowRun.totalItems}</strong>.
            </div>
            {workflowRun.totalItems && (
              <Progress
                type="circle"
                strokeColor={{
                  '0%': '#5503bb',
                  '100%': '#ff9c00',
                }}
                percent={Math.floor(((workflowRun.itemsProcessed ?? 0) * 100) / workflowRun.totalItems)}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
