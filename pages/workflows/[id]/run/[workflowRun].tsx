import { gql } from '@apollo/client'
import { Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageWrapper } from '../../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../../components/common/RequestStates/Loading'
import { RequestError } from '../../../../components/common/RequestStates/RequestError'
import { WorkflowRunStartedByOptions, WorkflowRunStatus } from '../../../../graphql'
import { withApollo } from '../../../../src/apollo'
import { useGetWorkflowRunById } from '../../../../src/services/WorkflowRunHooks'
import { getQueryParam } from '../../../../src/utils/nextUtils'
import { assertNever } from '../../../../src/utils/typescript.utils'

interface Props {
  workflowId: string
  workflowRunId: string
}

const workflowRunFragment = gql`
  fragment workflowRun on WorkflowRun {
    id
    createdAt
    status
    startedBy
    errorMessage
    errorResponse
    triggerRun {
      status
      workflowTriggered
      triggerIds
      finishedAt
      integrationName
      operationName
    }
    actionRuns {
      id
      status
      createdAt
      finishedAt
      integrationName
      operationName
    }
  }
`

function WorkflowRunPage({ workflowId, workflowRunId }: Props) {
  const router = useRouter()
  const { data, error, loading, startPolling, stopPolling } = useGetWorkflowRunById(workflowRunFragment, {
    variables: {
      id: workflowRunId,
    },
  })

  /**
   * Enable polling only if the workflow is running or sleeping
   */
  useEffect(() => {
    if (data?.workflowRun.status) {
      if ([WorkflowRunStatus.running, WorkflowRunStatus.sleeping].includes(data.workflowRun.status)) {
        startPolling(500)
      } else {
        stopPolling()
      }
    }
  }, [data?.workflowRun.status])

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflowRun) {
    return <RequestError error={error} />
  }

  const LOG_LEVEL_INFO = <Tag color="cyan">Info</Tag>
  const LOG_LEVEL_ERROR = <Tag color="red">Error</Tag>

  const workflowRun = data.workflowRun
  const dataSource = []

  // Add trigger logs
  if (workflowRun.triggerRun?.operationName) {
    dataSource.push({
      key: 'trigger-0',
      time: dayjs(workflowRun.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      operation: workflowRun.triggerRun.operationName,
      integration: workflowRun.triggerRun.integrationName,
      log: 'Checking trigger condition.',
      level: LOG_LEVEL_INFO,
    })
    const triggerIds = workflowRun.triggerRun.triggerIds
    if (triggerIds?.length) {
      dataSource.push({
        key: 'trigger-1',
        time: dayjs(workflowRun.triggerRun.finishedAt).format('YYYY-MM-DD HH:mm:ss'),
        operation: workflowRun.triggerRun.operationName,
        integration: workflowRun.triggerRun.integrationName,
        log: (
          <>
            Trigger ID{triggerIds.length > 1 ? 's' : ''}: <strong>{triggerIds.join(', ')}</strong>
          </>
        ),
        level: LOG_LEVEL_INFO,
      })
    }
    if (['completed', 'failed'].includes(workflowRun.triggerRun.status)) {
      const log =
        workflowRun.triggerRun.status === 'failed'
          ? 'Trigger check failed.'
          : workflowRun.triggerRun.workflowTriggered
          ? 'Trigger condition satisfied.'
          : 'Trigger condition not satisfied.'
      dataSource.push({
        key: 'trigger-2',
        time: dayjs(workflowRun.triggerRun.finishedAt).format('YYYY-MM-DD HH:mm:ss'),
        operation: workflowRun.triggerRun.operationName,
        integration: workflowRun.triggerRun.integrationName,
        log,
        level: workflowRun.triggerRun.status === 'failed' ? LOG_LEVEL_ERROR : LOG_LEVEL_INFO,
      })
    }
  }

  // Add action logs
  for (const actionRun of workflowRun.actionRuns || []) {
    dataSource.push({
      key: `${new Date(actionRun.createdAt).getTime()}-0`,
      time: dayjs(actionRun.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      operation: actionRun.operationName,
      integration: actionRun.integrationName,
      log: 'Running operation.',
      level: LOG_LEVEL_INFO,
    })
    if (['completed', 'failed'].includes(actionRun.status)) {
      const log = actionRun.status === 'failed' ? 'Operation run failed.' : 'Operation ran succesfully.'
      dataSource.push({
        key: `${new Date(actionRun.createdAt).getTime()}-1`,
        time: dayjs(actionRun.finishedAt).format('YYYY-MM-DD HH:mm:ss'),
        operation: actionRun.operationName,
        integration: actionRun.integrationName,
        log,
        level: actionRun.status === 'failed' ? LOG_LEVEL_ERROR : LOG_LEVEL_INFO,
      })
    }
  }

  if (workflowRun.errorMessage && dataSource.length > 1) {
    const lastDataSource = dataSource[dataSource.length - 1]
    dataSource.push({
      ...lastDataSource,
      key: 'error',
      log: `Error: ${workflowRun.errorMessage}`,
      level: LOG_LEVEL_ERROR,
    })
  }
  if (workflowRun.errorResponse && dataSource.length > 1) {
    const lastDataSource = dataSource[dataSource.length - 1]
    dataSource.push({
      ...lastDataSource,
      key: 'error',
      log: `Response: ${workflowRun.errorResponse}`,
      level: LOG_LEVEL_ERROR,
    })
  }

  const columns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      filters: [
        { text: 'Info', value: 'Info' },
        { text: 'Error', value: 'Error' },
      ],
      onFilter: (value: any, record: any) => {
        if (record.level === LOG_LEVEL_INFO) {
          return value === 'Info'
        }
        if (record.level === LOG_LEVEL_ERROR) {
          return value === 'Error'
        }
        return false
      },
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: 'Integration',
      dataIndex: 'integration',
      key: 'integration',
    },
    {
      title: 'Log message',
      dataIndex: 'log',
      key: 'log',
    },
  ]

  const handleGoBack = async () => {
    await router.push(`/workflows/${workflowId}`)
  }

  const getWorkflowStatusTag = () => {
    switch (workflowRun.status) {
      case WorkflowRunStatus.running:
        return (
          <Tag key="status" color="blue">
            Running
          </Tag>
        )
      case WorkflowRunStatus.sleeping:
        return (
          <Tag key="status" color="gold">
            Sleeping
          </Tag>
        )
      case WorkflowRunStatus.completed:
        if (workflowRun.triggerRun?.workflowTriggered) {
          return (
            <Tag key="status" color="green">
              Completed
            </Tag>
          )
        }
        return (
          <Tag key="status" color="blue">
            Trigger condition not satisfied
          </Tag>
        )
      case WorkflowRunStatus.failed:
        return (
          <Tag key="status" color="red">
            Failed
          </Tag>
        )
      default:
        assertNever(workflowRun.status)
        throw new Error('assert never')
    }
  }

  const getStartedByTag = () => {
    switch (workflowRun.startedBy) {
      case WorkflowRunStartedByOptions.trigger:
        return (
          <Tag key="started-by" color="geekblue">
            Started by schedule
          </Tag>
        )
      case WorkflowRunStartedByOptions.user:
        return (
          <Tag key="started-by" color="geekblue">
            Manually started
          </Tag>
        )
      case WorkflowRunStartedByOptions.workflowFailure:
        return (
          <Tag key="started-by" color="geekblue">
            Started by workflow failure
          </Tag>
        )
      default:
        assertNever(workflowRun.startedBy)
        throw new Error('assert never')
    }
  }

  return (
    <>
      <Head>
        <title>Workflow Run Logs</title>
      </Head>

      <PageWrapper title="Workflow Run Logs" onBack={handleGoBack} tags={[getWorkflowStatusTag(), getStartedByTag()]}>
        <Table dataSource={dataSource} columns={columns} />
      </PageWrapper>
    </>
  )
}

WorkflowRunPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    workflowId: getQueryParam(ctx, 'id').toLowerCase(),
    workflowRunId: getQueryParam(ctx, 'workflowRun').toLowerCase(),
  }
}

export default withApollo(WorkflowRunPage)
