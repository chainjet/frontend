import { gql } from '@apollo/client'

export const WorkflowDiagramFragments = {
  WorkflowTrigger: gql`
    fragment WorkflowDiagram_Trigger on WorkflowTrigger {
      id
      name
      integrationTrigger {
        id
        key
        name
        instant
        integration {
          id
          key
          name
          logo
        }
      }
    }
  `,

  WorkflowAction: gql`
    fragment WorkflowDiagram_Action on WorkflowAction {
      id
      name
      isRootAction
      nextActions {
        action {
          id
        }
        condition
      }
      integrationAction {
        id
        key
        name
        integration {
          id
          key
          name
          logo
        }
      }
    }
  `,
}