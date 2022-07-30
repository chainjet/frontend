import { gql } from '@apollo/client'
import { NextPageContext } from 'next'
import Router from 'next/router'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { Button, Card } from 'antd'
import { PageWrapper } from '../../../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../../../components/common/RequestStates/Loading'
import { RequestError } from '../../../../../components/common/RequestStates/RequestError'
import { withApollo } from '../../../../../src/apollo'
import { useGetWorkflows, useUpdateOneWorkflow } from '../../../../../src/services/WorkflowHooks'
import { getQueryParam } from '../../../../../src/utils/nextUtils'
import { WorkflowForm } from '../../../../../components/workflows/WorkflowForm'
import { Workflow, WorkflowTrigger } from '../../../../../graphql'
import { DeleteWorkflowModal } from '../../../../../components/workflows/DeleteWorkflowModal'
import { useUpdateOneWorkflowTrigger } from '../../../../../src/services/WorkflowTriggerHooks'

interface Props {
  username: string
  projectName: string
  workflowName: string
}

const workflowFragment = gql`
  fragment WorkflowSettingsPage on Workflow {
    id
    slug
    ...WorkflowForm_Workflow
    project {
      ...WorkflowForm_Project
    }
    trigger {
      ...WorkflowForm_WorkflowTrigger
    }
  }
  ${WorkflowForm.fragments.Workflow}
  ${WorkflowForm.fragments.Project}
  ${WorkflowForm.fragments.WorkflowTrigger}
`

function WorkflowSettingsPage (props: Props) {
  const { data, loading, error } = useGetWorkflows(workflowFragment, {
    variables: {
      filter: {
        slug: {
          eq: `${props.username}/${props.projectName}/workflow/${props.workflowName}`.toLowerCase()
        }
      }
    }
  })
  const [workflow, setWorkflow] = useState(data?.workflows.edges[0].node)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateWorkflow] = useUpdateOneWorkflow()
  const [updateWorkflowTrigger] = useUpdateOneWorkflowTrigger()
  const [deleteWorkflowModalOpen, setDeleteWorkflowModalOpen] = useState(false)

  useEffect(() => {
    setWorkflow(data?.workflows.edges[0].node)
  }, [data])

  if (loading) {
    return <Loading/>
  }
  if (error || !workflow) {
    return <RequestError error={error}/>
  }

  const handleWorkflowChange = (key: keyof Workflow, value: any) => {
    setWorkflow({
      ...workflow,
      [key]: value
    })
  }

  const handleWorkflowUpdate = async (update: Partial<Workflow> & Partial<WorkflowTrigger>) => {
    setUpdateLoading(true)
    try {
      if (update.maxConsecutiveFailures) {
        await updateWorkflowTrigger({
          variables: {
            input: {
              id: workflow.trigger?.id ?? '',
              update: {
                maxConsecutiveFailures: Number(update.maxConsecutiveFailures)
              }
            }
          }
        })
        delete update.maxConsecutiveFailures
      }
      const res = await updateWorkflow({
        variables: {
          input: {
            id: workflow.id,
            update,
          }
        }
      })
      await Router.push('/[username]/[project]/workflow/[workflow]', `/${res.data?.updateOneWorkflow.slug}`)
    } catch (e) {
      setUpdateError(e.message)
    }
    setUpdateLoading(false)
  }
  
  const handleWorkflowDelete = async () => {
    await Router.push('/[username]/[project]', `/${workflow.project.slug}`)
  }

  const handleGoBack = async () => {
    await Router.push('/[username]/[project]/workflow/[workflow]', `/${workflow.slug}`)
  }

  return (
    <>
      <Head>
        <title>{workflow.name} settings</title>
      </Head>

      <PageWrapper title={`Update workflow "${workflow.name}" settings`}
                   onBack={handleGoBack}>
        
        <Card>
            <WorkflowForm workflow={workflow}
                          showSubmit={true}
                          onChange={handleWorkflowChange}
                          onSubmit={handleWorkflowUpdate}
                          loading={updateLoading}
                          error={updateError}/>
        </Card>

        <Card title="Danger settings" style={{ marginTop: 24, border: '1px solid #d40000' }}>
          <Button type="primary" danger onClick={() => setDeleteWorkflowModalOpen(true)}>Delete workflow</Button>
        </Card>

        <DeleteWorkflowModal visible={deleteWorkflowModalOpen}
                             workflow={workflow}
                             onDeleteWorkflow={handleWorkflowDelete}
                             onCancel={() => setDeleteWorkflowModalOpen(false)}/>
      </PageWrapper>
    </>
  )
}

WorkflowSettingsPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    username: getQueryParam(ctx, 'username').toLowerCase(),
    projectName: getQueryParam(ctx, 'project').toLowerCase(),
    workflowName: getQueryParam(ctx, 'workflow').toLowerCase()
  }
}

export default withApollo(WorkflowSettingsPage)
