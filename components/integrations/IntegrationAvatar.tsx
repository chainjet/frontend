import { Avatar } from 'antd'
require('./IntegrationAvatar.less')

interface Props {
  integration: {
    name: string
    logo?: string | null
  }
  size?: number
}

export const IntegrationAvatar = ({ integration, size }: Props) => {
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
