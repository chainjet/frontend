import { gql } from '@apollo/client'
import { Table } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import { Workflow, WorkflowRun } from '../../graphql'

interface Props {
  workflowRuns: WorkflowRun[]
  workflow: Workflow
}

export const WorkflowRunsTable = ({ workflowRuns, workflow }: Props) => {
  dayjs.extend(relativeTime)

  const dataSource = workflowRuns.map((run) => ({
    key: run.id,
    started: <span title={run.createdAt}>{dayjs(run.createdAt).fromNow()}</span>,
    status: run.status,
    operationsUsed: run.operationsUsed,
    logs: (
      <Link key={run.id} href={`/workflows/${workflow.id}/run/${run.id}`}>
        <a>View logs</a>
      </Link>
    ),
  }))

  const columns = [
    {
      title: 'Run started',
      dataIndex: 'started',
      key: 'started',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Operations Used',
      dataIndex: 'operationsUsed',
      key: 'operationsUsed',
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
    },
  ]

  return <Table dataSource={dataSource} columns={columns} size="small" />
}

WorkflowRunsTable.fragments = {
  WorkflowRun: gql`
    fragment WorkflowRunsTable_WorkflowRun on WorkflowRun {
      id
      status
      createdAt
      triggerRun {
        workflowTriggered
      }
      operationsUsed
    }
  `,
  Workflow: gql`
    fragment WorkflowRunsTable_Workflow on Workflow {
      id
    }
  `,
}
