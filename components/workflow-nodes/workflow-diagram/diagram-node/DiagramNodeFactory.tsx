import React from 'react'
import { AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent } from '@projectstorm/react-canvas-core'
import { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { DiagramNodeModel } from './DiagramNodeModel'
import { DiagramNodeWidget } from './DiagramNodeWidget'

export class DiagramNodeFactory extends AbstractReactFactory<DiagramNodeModel, DiagramEngine> {
  constructor () {
    super('DiagramNode')
  }

  generateModel (_initialConfig: GenerateModelEvent): DiagramNodeModel {
    throw new Error('not implemented yet')
    // return new DiagramNodeModel()
  }

  generateReactWidget (event: GenerateWidgetEvent<DiagramNodeModel>): JSX.Element {
    return <DiagramNodeWidget engine={this.engine} node={event.model}/>
  }
}
