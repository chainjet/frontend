import { gql } from '@apollo/client'
import { Tooltip } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useEffect } from 'react'
import { RxDotFilled } from 'react-icons/rx'
import { SortDirection, Workflow, WorkflowRunSortFields } from '../../graphql'
import { useGetWorkflowRuns } from '../../src/services/WorkflowRunHooks'
import { useGetWorkflowTriggerById } from '../../src/services/WorkflowTriggerHooks'
import { Loading } from '../common/RequestStates/Loading'
import { RequestError } from '../common/RequestStates/RequestError'
import { WorkflowRunsTable } from './WorkflowRunsTable'

interface Props {
  open: boolean
  workflow: Workflow
  onClose: () => void
}

// this call is done individually because of frequent polling
const workflowTriggerFragment = gql`
  fragment WorkflowRunHistoryModalFragment on WorkflowTrigger {
    id
    lastCheck
  }
`

export const WorkflowRunHistoryModal = ({ open, workflow, onClose }: Props) => {
  dayjs.extend(relativeTime)

  const { data, error, loading, refetch } = useGetWorkflowRuns(WorkflowRunsTable.fragments.WorkflowRun, {
    skip: !open,
    pollInterval: 10000,
    variables: {
      filter: {
        workflow: {
          eq: workflow.id,
        },
      },
      sorting: [
        {
          field: 'createdAt' as WorkflowRunSortFields,
          direction: SortDirection.DESC,
        },
      ],
    },
  })
  const { data: triggerData, refetch: triggerRefetch } = useGetWorkflowTriggerById(workflowTriggerFragment, {
    skip: !open || !workflow.trigger,
    pollInterval: 10000,
    variables: {
      id: workflow.trigger?.id ?? '',
    },
  })

  // refetch on modal open
  useEffect(() => {
    void (async () => {
      await refetch?.()
      await triggerRefetch?.()
    })()
  }, [open, refetch, triggerRefetch])

  let modalContent
  if (loading) {
    modalContent = <Loading />
  } else if (error || !data?.workflowRuns.edges) {
    modalContent = <RequestError error={error} />
  } else {
    const workflowRuns = data.workflowRuns.edges.map((run) => run.node)
    modalContent = (
      <div>
        {triggerData?.workflowTrigger?.lastCheck && workflow.trigger?.enabled && (
          <div className="flex mb-4">
            <div>
              <RxDotFilled color="lime" size={24} />
            </div>
            <div>
              Last trigger check was{' '}
              <Tooltip title={triggerData.workflowTrigger.lastCheck}>
                {dayjs(triggerData.workflowTrigger.lastCheck).fromNow()}
              </Tooltip>
              .
            </div>
          </div>
        )}
        <WorkflowRunsTable workflowRuns={workflowRuns} workflow={workflow} />
      </div>
    )
  }

  return (
    <Modal
      title="Workflow Run History"
      open={open}
      onCancel={onClose}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      {modalContent}
    </Modal>
  )
}
