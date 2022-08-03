import React from 'react'
import { isBrowser } from '../../src/utils/environment'
import dynamic from 'next/dynamic'
import { Workflow } from '../../graphql'

const WorkflowDiagram = dynamic(() => import('./workflow-diagram/WorkflowDiagram'), {
  ssr: false,
})

interface Props {
  workflow: Workflow
  onWorkflowChange: () => void
}

export const WorkflowDiagramContainer = (props: Props) => {
  const { workflow, onWorkflowChange } = props
  return (
    <>
      {isBrowser && (
        <WorkflowDiagram
          workflow={workflow}
          workflowTrigger={workflow.trigger}
          workflowActions={(workflow.actions?.edges || []).map((action) => action.node)}
          onCreateWorkflowTrigger={onWorkflowChange}
          onUpdateWorkflowTrigger={onWorkflowChange}
          onDeleteWorkflowTrigger={onWorkflowChange}
          onCreateWorkflowAction={onWorkflowChange}
          onUpdateWorkflowAction={onWorkflowChange}
          onDeleteWorkflowAction={onWorkflowChange}
        />
      )}
    </>
  )
}

WorkflowDiagramContainer.fragments = {}
