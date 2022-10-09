import { EditOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Button } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { RequestError } from '../../../components/common/RequestStates/RequestError'
import { WorkflowDiagramFragments } from '../../../components/workflow-nodes/workflow-diagram/WorkflowDiagramFragments'
import { WorkflowDiagramContainer } from '../../../components/workflow-nodes/WorkflowDiagramContainer'
import { WorkflowRunHistoryModal } from '../../../components/workflow-runs/WorkflowRunHistoryModal'
import { WorkflowRunsTable } from '../../../components/workflow-runs/WorkflowRunsTable'
import { DeployWorkflowModal } from '../../../components/workflows/DeployWorkflowModal'
import { EnableWorkflowSwitch } from '../../../components/workflows/EnableWorkflowSwitch'
import { RenameWorkflowModal } from '../../../components/workflows/RenameWorkflowModal'
import { withApollo } from '../../../src/apollo'
import { useGetWorkflowById } from '../../../src/services/WorkflowHooks'
import { getQueryParam } from '../../../src/utils/nextUtils'
require('./workflow.less')

interface Props {
  workflowId: string
}

const workflowFragment = gql`
  fragment WorkflowPage on Workflow {
    id
    name
    network
    address
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

function WorkflowPage({ workflowId }: Props) {
  const router = useRouter()
  const { data, loading, error, refetch } = useGetWorkflowById(workflowFragment, {
    variables: {
      id: workflowId,
    },
  })
  const [runHistoryModalOpen, setRunHistoryModalOpen] = useState(false)
  const [deployWorkflowModalOpen, setDeployWorkflowModalOpen] = useState(false)
  const [renameWorkflowModalOpen, setRenameWorkflowModalOpen] = useState(false)

  const handleWorkflowChange = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleContractDeploy = useCallback(async () => {
    setDeployWorkflowModalOpen(false)
    handleWorkflowChange()
  }, [handleWorkflowChange])

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflow) {
    return <RequestError error={error} />
  }

  const { workflow } = data

  const handleGoBack = async () => {
    await router.push('/dashboard')
  }

  const handleSettingsClick = async () => {
    await router.push(`/workflows/${workflowId}/settings`)
  }

  const renderHeaderExtra = () => {
    return [
      workflow.trigger && (!workflow.network || workflow.address) && (
        <EnableWorkflowSwitch workflow={workflow} onWorkflowEnableChange={handleWorkflowChange} />
      ),

      workflow.network && !workflow.address && (
        <Button type="primary" key="deploy" onClick={() => setDeployWorkflowModalOpen(true)}>
          Deploy
        </Button>
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

      <RenameWorkflowModal
        workflow={workflow}
        visible={renameWorkflowModalOpen}
        onCancel={() => setRenameWorkflowModalOpen(false)}
        onWorkflowRename={() => setRenameWorkflowModalOpen(false)}
      />

      <PageWrapper
        title={
          <div className="group" onClick={() => setRenameWorkflowModalOpen(true)}>
            {workflow.name} <EditOutlined className="invisible cursor-pointer group-hover:visible" />
          </div>
        }
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

        {deployWorkflowModalOpen && (
          <DeployWorkflowModal
            visible={deployWorkflowModalOpen}
            workflow={workflow}
            onWorkflowDeploy={handleContractDeploy}
            onClose={() => setDeployWorkflowModalOpen(false)}
          />
        )}
      </PageWrapper>
    </>
  )
}

WorkflowPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    workflowId: getQueryParam(ctx, 'id').toLowerCase(),
  }
}

export default withApollo(WorkflowPage, { ssr: false })
