import {
  EditOutlined,
  ForkOutlined,
  HistoryOutlined,
  LockOutlined,
  PlusOutlined,
  SettingOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Alert, Button, Tooltip } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { RequestError } from '../../../components/common/RequestStates/RequestError'
import { EmailSettingsModal } from '../../../components/users/settings/EmailSettingsModal'
import { Address } from '../../../components/wallet/Address'
import { WorkflowDiagramFragments } from '../../../components/workflow-nodes/workflow-diagram/WorkflowDiagramFragments'
import { WorkflowDiagramContainer } from '../../../components/workflow-nodes/WorkflowDiagramContainer'
import { WorkflowRunHistoryModal } from '../../../components/workflow-runs/WorkflowRunHistoryModal'
import { WorkflowRunsTable } from '../../../components/workflow-runs/WorkflowRunsTable'
import { DeployWorkflowModal } from '../../../components/workflows/DeployWorkflowModal'
import { EnableWorkflowSwitch } from '../../../components/workflows/EnableWorkflowSwitch'
import { ForkWorkflowModal } from '../../../components/workflows/ForkWorkflowModal'
import { RenameWorkflowModal } from '../../../components/workflows/RenameWorkflowModal'
import { withApollo } from '../../../src/apollo'
import { useGetViewer, useSigner } from '../../../src/services/UserHooks'
import { useGetWorkflowById } from '../../../src/services/WorkflowHooks'
import { getLoginUrl } from '../../../src/utils/account.utils'
import { isServer } from '../../../src/utils/environment'
import { getHeadMetatags } from '../../../src/utils/html.utils'
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
    isTemplate
    ownerAddress
    isPublic
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

const userFragment = gql`
  fragment SettingsPage on User {
    id
    ...ProfileEmailForm_User
  }
  ${EmailSettingsModal.fragments.User}
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
  const [forkWorkflowModalOpen, setForkWorkflowModalOpen] = useState(false)
  const [renameWorkflowModalOpen, setRenameWorkflowModalOpen] = useState(false)
  const [emailSettingsModalOpen, setEmailSettingsModalOpen] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(router.query.success === 'true')
  const [showSubscribeMessage, setShowSubscribeMessage] = useState(!showSuccessMessage)
  const { address } = useAccount()
  const { signer } = useSigner()
  const { data: viewerData } = useGetViewer(userFragment, {
    skip: !signer,
  })

  useEffect(() => {
    setShowSuccessMessage(router.query.success === 'true')
  }, [router.query.success])

  const handleWorkflowChange = useCallback(async () => {
    await refetch?.()
  }, [refetch])

  const handleContractDeploy = useCallback(async () => {
    setDeployWorkflowModalOpen(false)
    handleWorkflowChange()
  }, [handleWorkflowChange])

  const handleForkWorkflow = useCallback(
    (forkId: string) => {
      if (forkId) {
        router.push(`/workflows/${forkId}?success=true`)
        setForkWorkflowModalOpen(false)
      }
    },
    [router],
  )

  const handleForkWorkflowClick = () => {
    if (address) {
      setForkWorkflowModalOpen(true)
    } else {
      router.push(getLoginUrl(router))
    }
  }

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflow) {
    return <RequestError error={error} />
  }

  const { workflow } = data
  const isOwnerByViewer = router.query.impersonate || workflow.ownerAddress === address

  const handleGoBack = async () => {
    await router.push('/dashboard')
  }

  const handleSettingsClick = async () => {
    await router.push(`/workflows/${workflowId}/settings`)
  }

  const renderHeaderExtra = () => [
    isOwnerByViewer && !workflow.isTemplate && workflow.trigger && (!workflow.network || workflow.address) && (
      <EnableWorkflowSwitch workflow={workflow} onWorkflowEnableChange={handleWorkflowChange} />
    ),

    isOwnerByViewer && !workflow.isTemplate && workflow.network && !workflow.address && (
      <Button type="primary" key="deploy" onClick={() => setDeployWorkflowModalOpen(true)}>
        Deploy
      </Button>
    ),

    workflow.isTemplate ? (
      <Tooltip title={`Create a workflow using this template`} placement="bottom" key="fork-tooltip">
        <Button type="primary" key="use-template" icon={<PlusOutlined />} onClick={handleForkWorkflowClick}>
          Use Template
        </Button>
      </Tooltip>
    ) : (
      <Tooltip title={`Create a copy of this workflow`} placement="bottom" key="fork-tooltip">
        <Button key="fork" icon={<ForkOutlined />} onClick={handleForkWorkflowClick}>
          Fork
        </Button>
      </Tooltip>
    ),

    isOwnerByViewer && !workflow.isTemplate && (
      <Button type="default" key="run-history" icon={<HistoryOutlined />} onClick={() => setRunHistoryModalOpen(true)}>
        Run history
      </Button>
    ),

    isOwnerByViewer && (
      <Button key="settings" onClick={handleSettingsClick} icon={<SettingOutlined />}>
        Settings
      </Button>
    ),
  ]

  if (isServer) {
    return (
      <Head>
        {getHeadMetatags({
          path: `/workflows/${workflow.id}`,
          title: workflow.name,
          description: `${workflow.isTemplate ? 'Template' : 'Workflow'} "${workflow.name}" created by ${
            workflow.ownerAddress
          }`,
        })}
      </Head>
    )
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: `/workflows/${workflow.id}`,
          title: workflow.name,
          description: `${workflow.isTemplate ? 'Template' : 'Workflow'} "${workflow.name}" created by ${
            workflow.ownerAddress
          }`,
        })}
      </Head>

      <RenameWorkflowModal
        workflow={workflow}
        visible={renameWorkflowModalOpen}
        onCancel={() => setRenameWorkflowModalOpen(false)}
        onWorkflowRename={() => setRenameWorkflowModalOpen(false)}
      />

      <PageWrapper
        title={
          <div className="group" onClick={() => isOwnerByViewer && setRenameWorkflowModalOpen(true)}>
            {workflow.name}{' '}
            {isOwnerByViewer && <EditOutlined className="invisible cursor-pointer group-hover:visible" />}
          </div>
        }
        extra={renderHeaderExtra()}
        header={
          <>
            <div className="flex gap-1">
              <div>
                Owned by: <Address address={workflow.ownerAddress} />
              </div>
              {workflow.isPublic ? (
                <div>
                  <Tooltip title="Public workflow" placement="bottom">
                    <UnlockOutlined />
                  </Tooltip>
                </div>
              ) : (
                <div>
                  <Tooltip title="Private workflow" placement="bottom">
                    <LockOutlined />
                  </Tooltip>
                </div>
              )}
            </div>
          </>
        }
        onBack={handleGoBack}
        className="workflow-diagram-container"
      >
        {showSuccessMessage && (
          <div className="px-2 md:px-8">
            <Alert
              message="Your workflow is ready!"
              description={
                <>
                  Congrats! Your workflow will be automated.
                  {viewerData?.viewer && !viewerData.viewer.subscribedToNotifications && (
                    <>
                      We recommend{' '}
                      <a className="text-blue-500" onClick={() => setEmailSettingsModalOpen(true)}>
                        enabling email notifications
                      </a>{' '}
                      to get alerted if something goes wrong.
                    </>
                  )}
                </>
              }
              type="success"
              showIcon
              closable
              onClose={() => setShowSuccessMessage(false)}
            />
          </div>
        )}

        {!showSuccessMessage &&
          showSubscribeMessage &&
          viewerData?.viewer &&
          !viewerData.viewer.subscribedToNotifications && (
            <Alert
              style={{ backgroundColor: '#e6f4ff', border: '1px solid #91caff' }}
              message={
                <>
                  We recommend{' '}
                  <a className="text-blue-500" onClick={() => setEmailSettingsModalOpen(true)}>
                    enabling email notifications
                  </a>{' '}
                  to get alerted if something goes wrong.
                </>
              }
              type="info"
              showIcon
              closable
              onClose={() => setShowSubscribeMessage(false)}
            />
          )}

        <WorkflowDiagramContainer
          workflow={workflow}
          readonly={!isOwnerByViewer}
          onWorkflowChange={handleWorkflowChange}
        />

        {runHistoryModalOpen && (
          <WorkflowRunHistoryModal
            open={runHistoryModalOpen}
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

        {forkWorkflowModalOpen && (
          <ForkWorkflowModal
            visible={forkWorkflowModalOpen}
            workflow={workflow}
            onWorkflowFork={handleForkWorkflow}
            onClose={() => setForkWorkflowModalOpen(false)}
          />
        )}

        {viewerData?.viewer && emailSettingsModalOpen && (
          <EmailSettingsModal
            user={viewerData?.viewer}
            open={emailSettingsModalOpen}
            onUserUpdate={() => setEmailSettingsModalOpen(false)}
            onCancel={() => setEmailSettingsModalOpen(false)}
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

export default withApollo(WorkflowPage)
