import {
  BaseModelOptions,
  DeserializeEvent
} from '@projectstorm/react-canvas-core'
import { PortModelAlignment } from '@projectstorm/react-diagrams'
import { NodeModel } from '@projectstorm/react-diagrams-core'
import { DefaultPortModel } from '@projectstorm/react-diagrams-defaults'
import { WorkflowNode } from '../../../../src/typings/Workflow'

interface NodeOptions {
  workflowNode: WorkflowNode
  isRootNode: boolean
  onCreateClick: (previousWorkflowNode?: WorkflowNode, condition?: string) => void
  onUpdateClick: (workflowNode: WorkflowNode) => void
  onDeleteClick: (workflowNode: WorkflowNode) => void
}

export class DecisionNodeModel extends NodeModel {
  private nodeId: string

  constructor (
    readonly nodeOptions: NodeOptions,
    options: BaseModelOptions = {}
  ) {
    super({
      ...options,
      type: 'DecisionNode'
    })

    this.nodeId = nodeOptions.workflowNode.id

    // setup an in and out port
    this.addPort(
      new DefaultPortModel({
        in: true,
        name: 'in'
      })
    )
    this.addPort(
      new DefaultPortModel({
        in: false,
        name: 'false',
        alignment: PortModelAlignment.LEFT
      })
    )
    this.addPort(
      new DefaultPortModel({
        in: false,
        name: 'true',
        alignment: PortModelAlignment.RIGHT
      })
    )
  }

  serialize () {
    return {
      ...super.serialize(),
      nodeId: this.nodeOptions.workflowNode.id
    }
  }

  deserialize (event: DeserializeEvent<this>): void {
    super.deserialize(event)
    this.nodeId = event.data.nodeId
  }
}
