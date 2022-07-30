import Modal from 'antd/lib/modal/Modal'
import React, { useEffect } from 'react'
import { SortDirection, Workflow, WorkflowRunSortFields } from '../../graphql'
import { useGetWorkflowRuns } from '../../src/services/WorkflowRunHooks'
import { Loading } from '../common/RequestStates/Loading'
import { RequestError } from '../common/RequestStates/RequestError'
import { WorkflowRunsTable } from './WorkflowRunsTable'

interface Props {
  visible: boolean
  workflow: Workflow
  onClose: () => void
}

export const WorkflowRunHistoryModal = (props: Props) => {
  const { visible, workflow, onClose } = props
  const { data, error, loading, refetch } = useGetWorkflowRuns(WorkflowRunsTable.fragments.WorkflowRun, {
    pollInterval: 3000,
    variables: {
      filter: {
        workflow: {
          eq: workflow.id
        }
      },
      sorting: [{
        field: 'createdAt' as WorkflowRunSortFields,
        direction: SortDirection.DESC
      }]
    }
  })

  useEffect(() => {
    void (async () => await refetch())()
  }, [visible])

  let modalContent
  if (loading) {
    modalContent = <Loading />
  } else if (error || !data?.workflowRuns.edges) {
    modalContent = <RequestError error={error}/>
  } else {
    const workflowRuns = data.workflowRuns.edges.map(run => run.node)
    modalContent = <WorkflowRunsTable workflowRuns={workflowRuns} workflow={workflow}/>
  }

  return (
    <Modal
      title="Workflow Run History"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      { modalContent }
    </Modal>
  )
}
