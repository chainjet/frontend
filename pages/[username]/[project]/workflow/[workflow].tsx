import { Loading } from '../../../../components/common/RequestStates/Loading'
import { PageWrapper } from '../../../../components/common/PageLayout/PageWrapper'
import { NextPageContext } from 'next'
import { withApollo } from '../../../../src/apollo'
import React, { useState } from 'react'
import { gql } from '@apollo/client'
import { WorkflowDiagramContainer } from '../../../../components/workflow-nodes/WorkflowDiagramContainer'
import { RequestError } from '../../../../components/common/RequestStates/RequestError'
import { useGetWorkflows } from '../../../../src/services/WorkflowHooks'
import './workflow.less'
import Router from 'next/router'
import { Button, Switch } from 'antd'
import { WorkflowDiagramFragments } from '../../../../components/workflow-nodes/workflow-diagram/WorkflowDiagramFragments'
import { HistoryOutlined, SettingOutlined } from '@ant-design/icons'
import { WorkflowRunHistoryModal } from '../../../../components/workflow-runs/WorkflowRunHistoryModal'
import { WorkflowRunsTable } from '../../../../components/workflow-runs/WorkflowRunsTable'
import { getQueryParam } from '../../../../src/utils/nextUtils'
import Head from 'next/head'
import { useUpdateOneWorkflowTrigger } from '../../../../src/services/WorkflowTriggerHooks'

interface Props {
  username: string
  projectName: string
  workflowName: string
}

const workflowFragment = gql`
  fragment WorkflowPage on Workflow {
    id
    name
    project {
      id
      slug
    }
    trigger {
      id
      enabled
      ...WorkflowDiagram_Trigger
    }
    actions {
      edges {
        node {
          ...WorkflowDiagram_Action
        }
      }
    }
    ...WorkflowRunsTable_Workflow
  }
  ${WorkflowDiagramFragments.WorkflowTrigger}
  ${WorkflowDiagramFragments.WorkflowAction}
  ${WorkflowRunsTable.fragments.Workflow}
`

function WorkflowPage(props: Props) {
  const { data, loading, error, refetch } = useGetWorkflows(workflowFragment, {
    variables: {
      filter: {
        slug: {
          eq: `${props.username}/${props.projectName}/workflow/${props.workflowName}`.toLowerCase(),
        },
      },
    },
  })
  const [updateWorkflowTrigger] = useUpdateOneWorkflowTrigger()
  const [runHistoryModalOpen, setRunHistoryModalOpen] = useState(false)
  const [changingWorkflowTriggerEnable, setChangingWorkflowTriggerEnable] = useState(false)

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflows?.edges?.[0]?.node) {
    return <RequestError error={error} />
  }

  const workflow = data.workflows.edges[0].node

  const handleWorkflowChange = async () => {
    await refetch()
  }

  const handleGoBack = async () => {
    await Router.push('/[username]/[project]', `/${workflow.project.slug}`)
  }

  const handleSettingsClick = async () => {
    await Router.push('/[username]/[project]/workflow/[workflow]/settings', `/${workflow.slug}/settings`)
  }

  const handleEnableClick = async (enabled: boolean) => {
    if (workflow.trigger) {
      setChangingWorkflowTriggerEnable(true)
      await updateWorkflowTrigger({
        variables: {
          input: {
            id: workflow.trigger.id,
            update: {
              enabled,
            },
          },
        },
      })
      setChangingWorkflowTriggerEnable(false)
    }
  }

  const renderHeaderExtra = () => {
    return [
      workflow.trigger && (
        <Switch
          checkedChildren="On"
          unCheckedChildren="Off"
          loading={changingWorkflowTriggerEnable}
          checked={workflow.trigger.enabled}
          onClick={handleEnableClick}
        />
      ),

      <Button type="default" key="run-history" icon={<HistoryOutlined />} onClick={() => setRunHistoryModalOpen(true)}>
        Run history
      </Button>,

      <Button key="settings" onClick={handleSettingsClick} icon={<SettingOutlined />}>
        Settings
      </Button>,
    ]
  }

  return (
    <>
      <Head>
        <title>{workflow.name}</title>
      </Head>

      <PageWrapper
        title={workflow.name}
        extra={renderHeaderExtra()}
        onBack={handleGoBack}
        className="workflow-diagram-container"
      >
        <WorkflowDiagramContainer workflow={workflow} onWorkflowChange={handleWorkflowChange} />

        {runHistoryModalOpen && (
          <WorkflowRunHistoryModal
            visible={runHistoryModalOpen}
            workflow={workflow}
            onClose={() => setRunHistoryModalOpen(false)}
          />
        )}
      </PageWrapper>
    </>
  )
}

WorkflowPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    username: getQueryParam(ctx, 'username').toLowerCase(),
    projectName: getQueryParam(ctx, 'project').toLowerCase(),
    workflowName: getQueryParam(ctx, 'workflow').toLowerCase(),
  }
}

export default withApollo(WorkflowPage)
