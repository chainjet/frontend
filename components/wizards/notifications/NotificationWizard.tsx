import { Card, List, Typography } from 'antd'
import { useState } from 'react'
import { NotificationTrigger, notificationTriggers } from '../../../src/constants/notification-triggers'
import { NotificationStep } from './NotificationStep'

interface TriggerOption {
  id: string
  name: string
  description: string
  component: JSX.Element
}

export function NotificationWizard() {
  const [notificationTrigger, setNotificationTrigger] = useState<NotificationTrigger | null>(null)

  const onNotificationTriggerSelected = (notificationTrigger: NotificationTrigger) => {
    setNotificationTrigger(notificationTrigger)
  }

  return (
    <Card>
      <div className="mb-8 text-xl">What should trigger the notification?</div>
      <div className="mb-8">
        <List
          itemLayout="horizontal"
          size="small"
          bordered
          dataSource={notificationTriggers}
          renderItem={(option) => (
            <List.Item
              onClick={() => onNotificationTriggerSelected(option)}
              className={`cursor-pointer hover:bg-blue-50 hover:shadow-sm ${
                notificationTrigger?.id === option.id ? 'bg-blue-50' : ''
              }`}
            >
              <List.Item.Meta
                title={option.name}
                description={<Typography.Paragraph type="secondary">{option.description}</Typography.Paragraph>}
              />
            </List.Item>
          )}
        />
      </div>
      <div>
        {notificationTrigger && (
          <NotificationStep key={notificationTrigger.id} notificationTrigger={notificationTrigger} />
        )}
      </div>
    </Card>
  )
}
