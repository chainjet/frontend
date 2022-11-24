import { Avatar, Tooltip } from 'antd'
import { Workflow } from '../../graphql'

interface Props {
  workflow: Workflow
  maxCount?: number
  size?: number
}

export const WorkflowIntegrationsGroup = ({ workflow, maxCount, size }: Props) => {
  const integrations = []
  if (workflow.trigger) {
    integrations.push(workflow.trigger.integrationTrigger.integration)
  }
  for (const action of workflow.actions?.edges ?? []) {
    if (!integrations.some((integration) => integration.id === action.node.integrationAction.integration.id)) {
      integrations.push(action.node.integrationAction.integration)
    }
  }
  return (
    <Avatar.Group maxCount={maxCount ?? 5}>
      {integrations.map((integration) => (
        <Tooltip key={integration.id} title={integration.name}>
          <Avatar src={integration.logo} style={{ width: size ?? 28, height: size ?? 28 }} />
        </Tooltip>
      ))}
    </Avatar.Group>
  )
}
