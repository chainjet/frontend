import { gql } from '@apollo/client'
import { Button, Card } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { RequestError } from '../../../components/common/RequestStates/RequestError'
import { ChangeWorkflowPrivacyModal } from '../../../components/workflows/ChangeWorkflowPrivacyModal'
import { DeleteWorkflowModal } from '../../../components/workflows/DeleteWorkflowModal'
import { WorkflowForm } from '../../../components/workflows/WorkflowForm'
import { Workflow, WorkflowTrigger } from '../../../graphql'
import { withApollo } from '../../../src/apollo'
import { useGetWorkflowById, useUpdateOneWorkflow } from '../../../src/services/WorkflowHooks'
import { useUpdateOneWorkflowTrigger } from '../../../src/services/WorkflowTriggerHooks'
import { getQueryParam } from '../../../src/utils/nextUtils'

interface Props {
  workflowId: string
}

const workflowFragment = gql`
  fragment WorkflowSettingsPage on Workflow {
    id
    isPublic
    ...WorkflowForm_Workflow
    trigger {
      ...WorkflowForm_WorkflowTrigger
    }
  }
  ${WorkflowForm.fragments.Workflow}
  ${WorkflowForm.fragments.WorkflowTrigger}
`

function WorkflowSettingsPage({ workflowId }: Props) {
  const router = useRouter()
  const { data, loading, error, refetch } = useGetWorkflowById(workflowFragment, {
    variables: {
      id: workflowId,
    },
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateWorkflow] = useUpdateOneWorkflow()
  const [updateWorkflowTrigger] = useUpdateOneWorkflowTrigger()
  const [changePrivacyModalOpen, setChangePrivacyModalOpen] = useState(false)
  const [deleteWorkflowModalOpen, setDeleteWorkflowModalOpen] = useState(false)

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflow) {
    return <RequestError error={error} />
  }
  const { workflow } = data

  const handleWorkflowChange = () => {
    refetch()
  }

  const handleWorkflowUpdate = async (update: Partial<Workflow> & Partial<WorkflowTrigger>) => {
    setUpdateLoading(true)
    try {
      if (update.maxConsecutiveFailures !== undefined && update.maxConsecutiveFailures !== null) {
        await updateWorkflowTrigger({
          variables: {
            input: {
              id: workflow.trigger?.id ?? '',
              update: {
                maxConsecutiveFailures: Number(update.maxConsecutiveFailures),
              },
            },
          },
        })
        delete update.maxConsecutiveFailures
      }
      if (update.templateSchema) {
        update.templateSchema = JSON.parse(update.templateSchema)
      }
      const res = await updateWorkflow({
        variables: {
          input: {
            id: workflow.id,
            update,
          },
        },
      })
      await refetch()
      await router.push(`/workflows/${workflowId}`)
    } catch (e: any) {
      setUpdateError(e?.message)
    }
    setUpdateLoading(false)
  }

  const handlePrivacyChange = async () => {
    await router.push(`/workflows/${workflowId}`)
  }

  const handleWorkflowDelete = async () => {
    await router.push('/dashboard')
  }

  const handleGoBack = async () => {
    await router.push(`/workflows/${workflowId}`)
  }

  return (
    <>
      <Head>
        <title>{workflow.name} settings</title>
      </Head>

      <PageWrapper title={`Update workflow "${workflow.name}" settings`} onBack={handleGoBack}>
        <Card>
          <WorkflowForm
            workflow={workflow}
            showSubmit={true}
            onChange={handleWorkflowChange}
            onSubmit={handleWorkflowUpdate}
            loading={updateLoading}
            error={updateError}
          />
        </Card>

        <Card title="Danger settings" style={{ marginTop: 24, border: '1px solid #d40000' }}>
          <div className="flex gap-2">
            <Button type="primary" danger onClick={() => setChangePrivacyModalOpen(true)}>
              Change workflow privacy
            </Button>
            <Button type="primary" danger onClick={() => setDeleteWorkflowModalOpen(true)}>
              Delete workflow
            </Button>
          </div>
        </Card>

        <ChangeWorkflowPrivacyModal
          visible={changePrivacyModalOpen}
          workflow={workflow}
          onPrivacyChange={handlePrivacyChange}
          onCancel={() => setDeleteWorkflowModalOpen(false)}
        />
        <DeleteWorkflowModal
          visible={deleteWorkflowModalOpen}
          workflow={workflow}
          onDeleteWorkflow={handleWorkflowDelete}
          onCancel={() => setDeleteWorkflowModalOpen(false)}
        />
      </PageWrapper>
    </>
  )
}

WorkflowSettingsPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    workflowId: getQueryParam(ctx, 'id').toLowerCase(),
  }
}

export default withApollo(WorkflowSettingsPage)
