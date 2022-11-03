import dynamic from 'next/dynamic'
import { Workflow } from '../../graphql'
import { isBrowser } from '../../src/utils/environment'

const WorkflowDiagram = dynamic(() => import('./workflow-diagram/WorkflowDiagram'), {
  ssr: false,
})

interface Props {
  workflow: Workflow
  readonly?: boolean
  onWorkflowChange: () => void
}

export const WorkflowDiagramContainer = ({ workflow, readonly, onWorkflowChange }: Props) => {
  return (
    <>
      {isBrowser && (
        <WorkflowDiagram
          workflow={workflow}
          workflowTrigger={workflow.trigger}
          workflowActions={(workflow.actions?.edges || []).map((action) => action.node)}
          readonly={readonly}
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
