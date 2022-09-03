import { gql } from '@apollo/client'
import { Card, List, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useGetProjects } from '../../../src/services/ProjectHooks'
import { Loading } from '../../common/RequestStates/Loading'
import { EventNotificationStep } from './EventNotificationStep'
import { NftNotificationStep } from './NftNotificationStep'
import { TokenNotificationStep } from './TokenNotificationStep'
import { TransactionNotificationStep } from './TransactionNotificationStep'

interface TriggerOption {
  id: string
  name: string
  description: string
  component: JSX.Element
}

const projectsFragment = gql`
  fragment NotificationWizardProjectsFragment on Project {
    id
    slug
    name
  }
`

export function NotificationWizard() {
  const { data, loading, error } = useGetProjects(projectsFragment)
  const [triggerOption, setTriggerOption] = useState<TriggerOption | null>(null)

  const projects = data?.projects.edges.map((edge) => edge.node)

  const triggerTypeOptions: TriggerOption[] = useMemo(
    () => [
      {
        id: 'token-transfer',
        name: 'Token received on an address',
        description: 'A notification is sent every time a token is received on a given address.',
        component: <TokenNotificationStep projects={projects ?? []} />,
      },
      {
        id: 'nft-transfer',
        name: 'NFT received on an address',
        description: 'A notification is sent every time a NFT is received on a given address.',
        component: <NftNotificationStep projects={projects ?? []} />,
      },
      {
        id: 'transaction',
        name: 'Transaction made on an address',
        description: 'A notification is sent every time a transaction is made on a given address.',
        component: <TransactionNotificationStep projects={projects ?? []} />,
      },
      {
        id: 'event',
        name: 'Event emitted by a smart contract',
        description: 'A notification is sent every time a given smart contract emits an event.',
        component: <EventNotificationStep projects={projects ?? []} />,
      },
    ],
    [projects],
  )

  if (!data?.projects?.edges?.length) {
    return <Loading />
  }

  const onTriggerOptionSelected = (option: TriggerOption) => {
    console.log(`Selected option: ${option.id}`)
    setTriggerOption(option)
  }

  return (
    <Card>
      <div className="mb-8 text-xl">What should trigger the notification?</div>
      <div className="mb-8">
        <List
          itemLayout="horizontal"
          size="small"
          bordered
          dataSource={triggerTypeOptions}
          renderItem={(option) => (
            <List.Item
              onClick={() => onTriggerOptionSelected(option)}
              className={`cursor-pointer hover:bg-blue-50 hover:shadow-sm ${
                triggerOption?.id === option.id ? 'bg-blue-50' : ''
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
      <div>{triggerOption && triggerOption.component}</div>
    </Card>
  )
}
