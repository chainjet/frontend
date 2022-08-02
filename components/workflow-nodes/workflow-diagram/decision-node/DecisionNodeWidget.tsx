import { DeleteTwoTone, EditTwoTone, PlusOutlined } from '@ant-design/icons'
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core'
import { Button, Col, Row } from 'antd'
import { WorkflowAction } from '../../../../graphql'
import './DecisionNode.less'
import { DecisionNodeModel } from './DecisionNodeModel'

interface DiagramNodeWidgetProps {
  node: DecisionNodeModel
  engine: DiagramEngine
}

export const DecisionNodeWidget = (props: DiagramNodeWidgetProps) => {
  const { node, engine } = props

  const workflowAction = node.nodeOptions.workflowNode as WorkflowAction

  const portIn = node.getPort('in')
  const portFalse = node.getPort('false')
  const portTrue = node.getPort('true')
  const portFalseHasNodes = workflowAction.nextActions?.some((action) => action.condition === 'false')
  const portTrueHasNodes = workflowAction.nextActions?.some((action) => action.condition === 'true')

  return (
    <div className="custom-node">
      {node.nodeOptions.isRootNode && (
        <Row justify="center" align="middle" style={{ marginBottom: '4px' }}>
          <Button
            type="dashed"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => node.nodeOptions.onCreateClick()}
          />
        </Row>
      )}

      <Row gutter={24}>
        <Col span={2} style={{ marginTop: portFalseHasNodes ? 62 : 44, left: portFalseHasNodes ? 0 : -36 }}>
          {portFalse && (
            <PortWidget engine={props.engine} port={portFalse}>
              <div className="circle-port" />
            </PortWidget>
          )}
          {!portFalseHasNodes && (
            <>
              <Button
                type="dashed"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => node.nodeOptions.onCreateClick(workflowAction, 'false')}
              />
              <div style={{ width: 40 }}>False</div>
            </>
          )}
        </Col>
        <Col>
          {portIn && (
            <PortWidget engine={engine} port={portIn}>
              <div className="circle-port" />
            </PortWidget>
          )}
          <div className="diamond">
            <div className="diamond-inner">
              <div>Decision</div>
              <div>
                <Button
                  type="link"
                  title="Edit"
                  key="edit"
                  icon={<EditTwoTone />}
                  onClick={() => node.nodeOptions.onUpdateClick(workflowAction)}
                />
                <Button
                  type="link"
                  title="Delete"
                  key="delete"
                  icon={<DeleteTwoTone />}
                  onClick={() => node.nodeOptions.onDeleteClick(workflowAction)}
                />
              </div>
            </div>
          </div>
        </Col>
        <Col span={2} style={{ marginTop: portTrueHasNodes ? 62 : 44, left: portTrueHasNodes ? 0 : 4 }}>
          {portTrue && (
            <PortWidget engine={props.engine} port={portTrue}>
              <div className="circle-port" />
            </PortWidget>
          )}
          {!portTrueHasNodes && (
            <>
              <Button
                type="dashed"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => node.nodeOptions.onCreateClick(workflowAction, 'true')}
              />
              <div style={{ width: 40 }}>True</div>
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}
