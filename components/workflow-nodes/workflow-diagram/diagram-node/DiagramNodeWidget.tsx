import { DeleteTwoTone, EditTwoTone, PlayCircleTwoTone, PlusOutlined } from '@ant-design/icons'
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core'
import { Button, Card, Row, Tooltip } from 'antd'
import Meta from 'antd/es/card/Meta'
import { useState } from 'react'
import { IntegrationTrigger } from '../../../../graphql'
import { useCheckWorkflowTrigger } from '../../../../src/services/WorkflowTriggerHooks'
import {
  getIntegrationFromWorkflowNode,
  getIntegrationNodeFromWorkflowNode,
  workflowNodeIsTrigger,
} from '../../../../src/utils/workflow.utils'
import { IntegrationAvatar } from '../../../integrations/IntegrationAvatar'
import { DiagramNodeModel } from './DiagramNodeModel'

interface DiagramNodeWidgetProps {
  node: DiagramNodeModel
  engine: DiagramEngine
}

// Fragments are defined on WorkflowDiagramFragments because react-diagram modules can't be directly imported with ssr

export const DiagramNodeWidget = (props: DiagramNodeWidgetProps) => {
  const { node, engine } = props
  const [checkWorkflowTrigger] = useCheckWorkflowTrigger()
  const [isCheckingWorkflowTrigger, setIsCheckingWorkflowTrigger] = useState(false)

  const portIn = node.getPort('in')
  const portOut = node.getPort('out')

  const { workflowNode, workflow } = node.nodeOptions
  const integration = getIntegrationFromWorkflowNode(workflowNode)
  const integrationNode = getIntegrationNodeFromWorkflowNode(workflowNode)
  const nodeIsTrigger = workflowNodeIsTrigger(workflowNode)
  const actions: JSX.Element[] = []
  const nodeType = nodeIsTrigger ? 'trigger' : 'action'
  const isInstantTrigger = nodeIsTrigger && (integrationNode as IntegrationTrigger).instant
  const canRunNode = nodeIsTrigger && !isInstantTrigger && workflow.actions?.edges?.length

  const handleCheckTriggerClick = async () => {
    setIsCheckingWorkflowTrigger(true)
    await checkWorkflowTrigger({
      variables: {
        id: workflowNode.id,
      },
    })
    setIsCheckingWorkflowTrigger(false)
  }

  if (canRunNode) {
    actions.push(
      <Tooltip title="Run trigger check" placement="bottom">
        <Button
          type="link"
          key="run-trigger-check"
          title="Run trigger check"
          icon={<PlayCircleTwoTone />}
          onClick={handleCheckTriggerClick}
          loading={isCheckingWorkflowTrigger}
        />
      </Tooltip>,
    )
  }

  return (
    <div className="custom-node">
      {!nodeIsTrigger && node.nodeOptions.isRootNode && (
        <Row justify="center" align="middle" style={{ marginBottom: '4px' }}>
          <Button
            type="dashed"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => node.nodeOptions.onCreateClick()}
          />
        </Row>
      )}

      {portIn && (
        <PortWidget engine={engine} port={portIn}>
          <div className="circle-port" />
        </PortWidget>
      )}
      <Card
        size="small"
        actions={[
          ...actions,
          <Tooltip title={`Update ${nodeType}`} placement="bottom" key={actions.length}>
            <Button
              type="link"
              title={`Update ${nodeType}`}
              key="update"
              icon={<EditTwoTone />}
              onClick={() => node.nodeOptions.onUpdateClick(workflowNode)}
            />
          </Tooltip>,
          <Tooltip title={`Delete ${nodeType}`} placement="bottom" key={actions.length + 1}>
            <Button
              type="link"
              title={`Delete ${nodeType}`}
              key="delete"
              icon={<DeleteTwoTone />}
              onClick={() => node.nodeOptions.onDeleteClick(workflowNode)}
            />
          </Tooltip>,
        ]}
      >
        <Meta
          avatar={<IntegrationAvatar integration={integration} />}
          title={integration.name.replace(/\([^)]*\)/, '')}
          description={workflowNode.name.replace(/\([^)]*\)/, '')}
        />
      </Card>
      {portOut && (
        <PortWidget engine={props.engine} port={portOut}>
          <div className="circle-port" />
        </PortWidget>
      )}

      <Row justify="center" align="middle" style={{ marginTop: '4px' }}>
        <Button
          type="dashed"
          shape="circle"
          icon={<PlusOutlined />}
          onClick={() => node.nodeOptions.onCreateClick(workflowNode)}
        />
      </Row>
    </div>
  )
}
