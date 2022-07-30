import { JSONSchema7 } from 'json-schema'
import { WorkflowAction, WorkflowTrigger } from '../../graphql'

export type WorkflowNode = WorkflowTrigger | WorkflowAction

export type WorkflowOutput = {
  nodeId: string
  nodeName: string
  nodeLogo?: string
  schema: JSONSchema7
}
