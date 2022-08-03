import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core'
import { NodeModel } from '@projectstorm/react-diagrams-core'
import { Workflow } from '../../../../graphql'

interface NodeOptions {
  workflow: Workflow
  onCreateTriggerClick: () => void
  onCreateActionClick: () => void
}

export class AddTriggerActionNodeModel extends NodeModel {
  constructor(readonly nodeOptions: NodeOptions, options: BaseModelOptions = {}) {
    super({
      ...options,
      type: 'AddTriggerActionNode',
    })
  }

  serialize() {
    return {
      ...super.serialize(),
    }
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event)
  }
}
