import { Avatar } from 'antd'
import { Integration } from '../../graphql'
require('./IntegrationAvatar.less')

interface Props {
  integration: Integration
  size?: number
}

export const IntegrationAvatar = (props: Props) => {
  const { integration, size } = props

  if (integration.logo) {
    return (
      <Avatar shape="square" size={size ?? 36} src={integration.logo} alt={integration.name} className="card-avatar" />
    )
  }

  return (
    <Avatar size={size ?? 'large'} gap={1}>
      {integration.name}
    </Avatar>
  )
}
