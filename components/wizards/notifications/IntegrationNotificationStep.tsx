import { gql } from '@apollo/client'
import { Card, List } from 'antd'
import { useState } from 'react'
import { Integration } from '../../../graphql'
import { useGetAsyncSchemas } from '../../../src/services/AsyncSchemaHooks'
import { useGetIntegrationActions } from '../../../src/services/IntegrationActionHooks'
import { useGetIntegrations } from '../../../src/services/IntegrationHooks'
import { SchemaForm } from '../../common/Forms/schema-form/SchemaForm'
import { Loading } from '../../common/RequestStates/Loading'
import { IntegrationAvatar } from '../../integrations/IntegrationAvatar'
import { SelectCredentials } from '../../workflow-nodes/drawer/steps/credentials/SelectCredentials'

const integrationFragment = gql`
  fragment IntegrationNotificationStepFragment on Integration {
    id
    key
    logo
    integrationAccount {
      ...SelectCredentials_IntegrationAccount
    }
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

const integrationActionFragment = gql`
  fragment IntegrationNotificationStepIntegrationActionFragment on IntegrationAction {
    id
    key
  }
`

const notificationIntegrations = [
  {
    key: 'email',
    name: 'Email',
  },
  {
    key: 'discord',
    name: 'Discord',
  },
  {
    key: 'telegram',
    name: 'Telegram',
  },
  {
    key: 'xmtp',
    name: 'XMTP',
  },
]

export function IntegrationNotificationStep({
  onIntegrationChange,
}: {
  onIntegrationChange: (integration: Integration, credentialsId?: string, extraInputs?: Record<string, any>) => void
}) {
  const [integrationSelected, setIntegrationSelected] = useState<Integration>()
  const [credentialsId, setCredentialsId] = useState<string>()
  const [extraInputs, setExtraInputs] = useState<Record<string, any>>({})
  const { data, loading, error } = useGetIntegrations(integrationFragment, {
    variables: {
      filter: {
        key: {
          in: notificationIntegrations.map(({ key }) => key),
        },
      },
    },
  })
  const integrations = data?.integrations.edges.map((edge) => edge.node)

  // get discord send message action and channel ids
  const { data: integrationActionsData } = useGetIntegrationActions(integrationActionFragment, {
    skip: integrationSelected?.key !== 'discord',
    variables: {
      filter: {
        integration: { eq: integrationSelected?.id },
        key: { eq: 'sendMessage' },
      },
    },
  })
  const discordAction = integrationActionsData?.integrationActions?.edges?.[0]?.node
  const { data: discordData } = useGetAsyncSchemas({
    skip: integrationSelected?.key !== 'discord' || !credentialsId || !discordAction?.id,
    variables: {
      integrationId: integrationSelected?.id ?? '',
      accountCredentialId: credentialsId ?? '',
      names: ['channelId'],
      integrationActionId: discordAction?.id,
    },
  })
  const discordChannelPropSchema = discordData?.asyncSchemas?.schemas
  const discordDefaultChannelId = (discordChannelPropSchema?.channelId?.oneOf?.[0] as any)?.const ?? ''

  if (!integrations?.length) {
    return <Loading />
  }

  const onIntegrationSelect = (integration: Integration) => {
    setIntegrationSelected(integration)

    // only submit if the integration has no credentials
    if (!integration.integrationAccount) {
      onIntegrationChange(integration, credentialsId)
    }
  }

  const onCredentialSelected = (id: string) => {
    setCredentialsId(id)
    if (integrationSelected) {
      if (integrationSelected.key !== 'discord' || extraInputs.channelId) {
        onIntegrationChange(integrationSelected, id, extraInputs)
      }
    }
  }

  const onDiscordInputsSelected = (inputs: Record<string, any>) => {
    if (integrationSelected && credentialsId) {
      inputs.channelId = inputs.channelId ?? discordDefaultChannelId
      const newInputs = { ...extraInputs, ...inputs }
      onIntegrationChange(integrationSelected, credentialsId, newInputs)
      setExtraInputs(newInputs)
    }
  }

  const onFormInputsChanged = (inputs: Record<string, any>) => {
    if (integrationSelected) {
      const newInputs = { ...extraInputs, ...inputs }
      setExtraInputs(newInputs)
      onIntegrationChange(integrationSelected, credentialsId, newInputs)
    }
  }

  return (
    <>
      <div className="mb-8 text-xl">Where should we notify?</div>
      <List
        dataSource={notificationIntegrations}
        loading={loading}
        bordered={false}
        itemLayout="horizontal"
        grid={{
          gutter: 16,
          xs: 1,
          sm: 3,
          md: 4,
          lg: 4,
          xl: 4,
          xxl: 4,
        }}
        renderItem={({ key, name }) => {
          const integration = integrations.find((i) => i.key === key)!
          const isSelected = integrationSelected?.id === integration.id
          return (
            <List.Item onClick={() => onIntegrationSelect(integration)}>
              <Card hoverable bordered bodyStyle={isSelected ? { backgroundColor: 'rgb(239, 246, 255)' } : {}}>
                <Card.Meta avatar={<IntegrationAvatar integration={integration} />} title={name} description="" />
              </Card>
            </List.Item>
          )
        }}
      />
      {integrationSelected?.integrationAccount && (
        <div className="mt-4">
          <SelectCredentials
            integrationAccount={integrationSelected.integrationAccount}
            onCredentialsSelected={onCredentialSelected}
            hideNameInput
            hideSubmitButton
            autoConnectIfNoAccount
          />
        </div>
      )}
      {integrationSelected?.key === 'email' && (
        <div className="mt-8">
          <SchemaForm
            schema={{
              type: 'object',
              required: ['email'],
              properties: {
                email: {
                  type: 'string',
                  title: 'Email',
                  description: `Enter you email`,
                  format: 'email',
                },
              },
            }}
            onChange={onFormInputsChanged}
            onSubmit={() => {}}
            initialInputs={extraInputs}
            hideSubmit
          />
        </div>
      )}
      {integrationSelected?.key === 'discord' &&
        credentialsId &&
        (discordChannelPropSchema?.channelId ? (
          <div className="mt-8" style={{ marginBottom: -32 }}>
            <SchemaForm
              schema={{
                type: 'object',
                required: ['channelId'],
                properties: {
                  channelId: {
                    default: discordDefaultChannelId,
                    title: 'Discord Channel',
                    type: 'string',
                    ...discordChannelPropSchema.channelId,
                  },
                },
              }}
              onChange={onDiscordInputsSelected}
              onSubmit={() => {}}
              initialInputs={extraInputs}
              hideSubmit
            />
          </div>
        ) : (
          <Loading />
        ))}
      {integrationSelected?.key === 'telegram' && (
        <div className="mt-8">
          <SchemaForm
            schema={{}}
            onChange={onFormInputsChanged}
            onSubmit={() => {}}
            initialInputs={extraInputs}
            hideSubmit
          />
        </div>
      )}
      {integrationSelected?.key === 'xmtp' && (
        <div className="mt-8">
          <SchemaForm
            schema={{}}
            onChange={onFormInputsChanged}
            onSubmit={() => {}}
            initialInputs={extraInputs}
            hideSubmit
          />
        </div>
      )}
    </>
  )
}
