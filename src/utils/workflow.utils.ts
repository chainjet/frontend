import { Integration, WorkflowAction, WorkflowTrigger } from '../../graphql'
import { IntegrationNode } from '../typings/Integration'
import { WorkflowNode } from '../typings/Workflow'

export function getIntegrationNodeFromWorkflowNode(workflowNode: WorkflowNode): IntegrationNode {
  return (workflowNode as WorkflowTrigger)?.integrationTrigger || (workflowNode as WorkflowAction)?.integrationAction
}

export function getIntegrationFromWorkflowNode(workflowNode: WorkflowNode): Integration {
  const integrationNode = getIntegrationNodeFromWorkflowNode(workflowNode)
  return integrationNode.integration
}

export function workflowNodeIsTrigger(workflowNode: WorkflowNode): boolean {
  return !!(workflowNode as WorkflowTrigger)?.integrationTrigger
}
