import React from 'react'
import { AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent } from '@projectstorm/react-canvas-core'
import { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { DecisionNodeModel } from './DecisionNodeModel'
import { DecisionNodeWidget } from './DecisionNodeWidget'

export class DecisionNodeFactory extends AbstractReactFactory<DecisionNodeModel, DiagramEngine> {
  constructor() {
    super('DecisionNode')
  }

  generateModel(_initialConfig: GenerateModelEvent): DecisionNodeModel {
    throw new Error('not implemented yet')
    // return new DecisionNodeModel()
  }

  generateReactWidget(event: GenerateWidgetEvent<DecisionNodeModel>): JSX.Element {
    return <DecisionNodeWidget engine={this.engine} node={event.model} />
  }
}
