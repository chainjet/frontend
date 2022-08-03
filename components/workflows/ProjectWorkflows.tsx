import React from 'react'
import { gql } from '@apollo/client'
import { useGetWorkflows } from '../../src/services/WorkflowHooks'
import { Loading } from '../common/RequestStates/Loading'
import { WorkflowsTable } from './WorkflowsTable'
import { RequestError } from '../common/RequestStates/RequestError'
import { Project } from '../../graphql'

const workflowsFragment = gql`
  fragment ProjectWorkflowFragment on Workflow {
    ...WorkflowsTable_Workflow
  }
  ${WorkflowsTable.fragments.Workflow}
`

interface Props {
  project: Project
}

export const ProjectWorkflows = (props: Props) => {
  const { project } = props

  const { data, loading, error } = useGetWorkflows(workflowsFragment, {
    variables: {
      filter: {
        project: { eq: project.id },
      },
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.workflows) {
    return <RequestError error={error} />
  }

  const workflows = data.workflows.edges.map((workflow) => workflow.node)

  return <WorkflowsTable project={project} workflows={workflows} />
}

ProjectWorkflows.fragments = {
  Project: gql`
    fragment ProjectWorkflows_Project on Project {
      ...WorkflowsTable_Project
    }
    ${WorkflowsTable.fragments.Project}
  `,
}
