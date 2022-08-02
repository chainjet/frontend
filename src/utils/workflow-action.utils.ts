/**
 * Returns a list with the ancestor nodes of a given target
 */
import { WorkflowAction } from '../../graphql'

export function getActionAncestryList(actions: WorkflowAction[], target: WorkflowAction): WorkflowAction[] {
  function getAncestryListFromNode(
    node: WorkflowAction,
    target: WorkflowAction,
    nodeParents: WorkflowAction[] = [],
  ): WorkflowAction[] {
    if (node.id === target.id) {
      return nodeParents
    }
    return (
      (node.nextActions || [])
        .map((next) => actions.find((x) => x.id === next.action.id))
        .filter((action) => !!action)
        .map((action) => getAncestryListFromNode(action!, target, [...nodeParents, node]))
        .find((list) => list.length) || []
    )
  }

  // Find a list with elements from every root action and return the one with elemets
  return (
    actions
      .filter((action) => action.isRootAction)
      .map((action) => getAncestryListFromNode(action, target))
      .find((list) => list.length) || []
  )
}
