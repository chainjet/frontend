import React from 'react'
import { AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent } from '@projectstorm/react-canvas-core'
import { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { AddTriggerActionNodeModel } from './AddTriggerActionNodeModel'
import { AddTriggerActionNodeWidget } from './AddTriggerActionNodeWidget'

export class AddTriggerActionNodeFactory extends AbstractReactFactory<AddTriggerActionNodeModel, DiagramEngine> {
  constructor() {
    super('AddTriggerActionNode')
  }

  generateModel(_initialConfig: GenerateModelEvent): AddTriggerActionNodeModel {
    throw new Error('not implemented yet')
  }

  generateReactWidget(event: GenerateWidgetEvent<AddTriggerActionNodeModel>): JSX.Element {
    return <AddTriggerActionNodeWidget node={event.model} />
  }
}
