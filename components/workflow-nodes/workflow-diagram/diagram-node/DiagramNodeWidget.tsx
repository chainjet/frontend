import { DeleteTwoTone, EditTwoTone, PlayCircleTwoTone, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
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

export const DiagramNodeWidget = ({ node, engine }: DiagramNodeWidgetProps) => {
  const [checkWorkflowTrigger] = useCheckWorkflowTrigger()
  const [isCheckingWorkflowTrigger, setIsCheckingWorkflowTrigger] = useState(false)

  const portIn = node.getPort('in')
  const portOut = node.getPort('out')

  const { workflowNode, workflow, readonly } = node.nodeOptions
  const integration = getIntegrationFromWorkflowNode(workflowNode)
  const integrationNode = getIntegrationNodeFromWorkflowNode(workflowNode)
  const nodeIsTrigger = workflowNodeIsTrigger(workflowNode)
  const actions: JSX.Element[] = []
  const nodeType = nodeIsTrigger ? 'trigger' : 'action'
  const isInstantTrigger = nodeIsTrigger && (integrationNode as IntegrationTrigger).instant
  const canRunNode = !readonly && nodeIsTrigger && !isInstantTrigger && workflow.actions?.edges?.length

  const handleCheckTriggerClick = async () => {
    setIsCheckingWorkflowTrigger(true)
    await checkWorkflowTrigger({
      variables: {
        id: workflowNode.id,
      },
    })
    setIsCheckingWorkflowTrigger(false)
  }

  if (readonly) {
    actions.push(
      <Tooltip title={`View ${nodeType}`} placement="bottom" key="view-trigger-option">
        <Button
          block
          type="text"
          title={`View ${nodeType} details`}
          key="view"
          icon={<UnorderedListOutlined />}
          onClick={() => node.nodeOptions.onUpdateClick(workflowNode)}
        >
          Details
        </Button>
      </Tooltip>,
    )
  } else {
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
    actions.push(
      <Tooltip title={`Update ${nodeType}`} placement="bottom" key="update-trigger-option">
        <Button
          type="link"
          title={`Update ${nodeType}`}
          key="update"
          icon={<EditTwoTone />}
          onClick={() => node.nodeOptions.onUpdateClick(workflowNode)}
        />
      </Tooltip>,
    )
    actions.push(
      <Tooltip title={`Delete ${nodeType}`} placement="bottom" key="delete-trigger-option">
        <Button
          type="link"
          title={`Delete ${nodeType}`}
          key="delete"
          icon={<DeleteTwoTone />}
          onClick={() => node.nodeOptions.onDeleteClick(workflowNode)}
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
      <Card size="small" actions={actions}>
        <Meta
          avatar={<IntegrationAvatar integration={integration} />}
          title={integration.name.replace(/\([^)]*\)/, '')}
          description={workflowNode.name.replace(/\([^)]*\)/, '')}
        />
      </Card>
      {portOut && (
        <PortWidget engine={engine} port={portOut}>
          <div className="circle-port" />
        </PortWidget>
      )}

      {!readonly && (
        <Row justify="center" align="middle" style={{ marginTop: '4px' }}>
          <Button
            type="dashed"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => node.nodeOptions.onCreateClick(workflowNode)}
          />
        </Row>
      )}
    </div>
  )
}
