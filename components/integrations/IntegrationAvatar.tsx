import { Avatar } from 'antd'
import { AvatarSize } from 'antd/lib/avatar/SizeContext'
require('./IntegrationAvatar.less')

interface Props {
  integration: {
    name: string
    logo?: string | null
  }
  size?: AvatarSize
  className?: string
}

export const IntegrationAvatar = ({ integration, size, className }: Props) => {
  if (integration.logo) {
    return (
      <Avatar
        shape="square"
        size={size ?? 36}
        src={integration.logo}
        alt={integration.name}
        className={`card-avatar ${className}`}
      />
    )
  }

  return (
    <Avatar size={size ?? 'large'} gap={1}>
      {integration.name}
    </Avatar>
  )
}
