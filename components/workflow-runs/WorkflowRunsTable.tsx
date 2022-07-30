import { gql } from '@apollo/client'
import { Table } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import React from 'react'
import { Workflow, WorkflowRun } from '../../graphql'

interface Props {
  workflowRuns: WorkflowRun[]
  workflow: Workflow
}

export const WorkflowRunsTable = (props: Props) => {
  dayjs.extend(relativeTime)
  const { workflowRuns, workflow } = props

  const dataSource = workflowRuns.map(run => ({
    key: run.id,
    started: <span title={run.createdAt}>{dayjs(run.createdAt).fromNow()}</span>,
    status: run.status,
    workflowTriggered: run.triggerRun?.workflowTriggered ? 'Yes' : 'No',
    operationsUsed: run.operationsUsed,
    logs: (
      <Link href="/[username]/[project]/workflow/[workflow]/run/[workflowRun]" as={`/${workflow.slug}/run/${run.id}`}>
        <a>View logs</a>
      </Link>
    )
  }))

  const columns = [
    {
      title: 'Run started',
      dataIndex: 'started',
      key: 'started'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: 'Workflow Triggered',
      dataIndex: 'workflowTriggered',
      key: 'workflowTriggered'
    },
    {
      title: 'Operations Used',
      dataIndex: 'operationsUsed',
      key: 'operationsUsed'
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs'
    }
  ]

  return (
    <Table dataSource={dataSource} columns={columns} size="small"/>
  )
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
      slug
    }
  `
}
