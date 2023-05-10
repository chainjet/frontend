import { Card } from 'antd'
import Link from 'next/link'
import { notificationTriggers } from '../../../src/constants/notification-triggers'
import { IntegrationAvatar } from '../../integrations/IntegrationAvatar'

export function NotificationWizard() {
  return (
    <Card>
      <div className="mb-2 text-2xl text-center">Create a new notification</div>
      <div className="mb-8 text-center text-gray-500">Receive notifications by Email, Discord, Telegram, or XMTP.</div>
      <div className="mb-8">
        {notificationTriggers.map((notification) => (
          <div key={notification.id} className="mb-4">
            <Link href={`/create/notification/${notification.id}`}>
              <Card hoverable>
                <Card.Meta
                  title={<div className="whitespace-normal">{notification.name}</div>}
                  description={notification.description}
                  avatar={<IntegrationAvatar integration={{ name: '', logo: notification.image }} size={40} />}
                />
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  )
}
