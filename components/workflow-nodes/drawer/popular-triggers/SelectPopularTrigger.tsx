import { gql } from '@apollo/client'
import { Button, List, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { IntegrationTrigger } from '../../../../graphql'
import { useGetIntegrations } from '../../../../src/services/IntegrationHooks'
import { useGetIntegrationTriggers } from '../../../../src/services/IntegrationTriggerHooks'
import { getEtherscanNetworkSchema } from '../../../../src/utils/blockchain.utils'
import { Loading } from '../../../common/RequestStates/Loading'
import { SelectCredentials } from '../steps/SelectCredentials'
import { SelectWorkflowNode } from '../steps/SelectWorkflowNode'
import { SelectCustomPopularTrigger } from './SelectCustomPopularTrigger'
import { PopularTrigger } from './types'

interface PopularIntegration {
  name: string
  logo: string
  triggers: PopularTrigger[]
}

const triggers: PopularIntegration[] = [
  {
    name: 'Schedule',
    logo: '/logos/schedule.svg',
    triggers: [
      {
        integrationKey: 'schedule',
        operationId: 'schedule',
        name: 'Time interval',
        description: 'Triggered based on a predefined interval',
      },
    ],
  },
  {
    name: 'Blockchain',
    logo: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/blockchain.svg',
    triggers: [
      {
        integrationKey: 'blockchain',
        operationId: 'newEvent',
        name: 'New event',
        description: 'Triggered when an event is emitted by a smart contract',
      },
      {
        getIntegrationKey: (inputs: Record<string, any>) => inputs.network,
        operationId: 'listTransactions',
        name: 'New transaction',
        description: 'Triggered when a new transaction is made on a smart contract',
        schema: {
          type: 'object',
          required: ['network', 'address'],
          properties: {
            network: getEtherscanNetworkSchema(),
            address: {
              title: 'Receiver address',
              description: 'The address to get the transactions for',
              type: 'string',
            },
          },
        },
      },
      {
        getIntegrationKey: (inputs: Record<string, any>) => inputs.network,
        operationId: 'listERC20TokenTransfers',
        name: 'New token transfer',
        description: 'Triggered when a token is transfered',
        schema: {
          type: 'object',
          required: ['network'],
          properties: {
            network: getEtherscanNetworkSchema(),
            address: {
              title: 'Receiver address',
              description: 'Filter by receiver address',
              type: 'string',
            },
            contractaddress: {
              title: 'Token address',
              description: 'Filter by token contract address',
              type: 'string',
            },
          },
        },
        validate: (inputs: Record<string, any>) => {
          if (!inputs.address && !inputs.contractaddress) {
            throw new Error('Either receiver address or token address must be provided.')
          }
          return true
        },
      },
      {
        getIntegrationKey: (inputs: Record<string, any>) => inputs.network,
        getOperationId: (inputs: Record<string, any>) =>
          inputs.nftType === 'ERC1155' ? 'listERC1155TokenTransfers' : 'listERC721TokenTransfers',
        name: 'New NFT transfer',
        description: 'Triggered when a NFT is transfered',
        schema: {
          type: 'object',
          required: ['network', 'nftType'],
          properties: {
            network: getEtherscanNetworkSchema(),
            nftType: {
              title: 'NFT type',
              type: 'string',
              default: 'ERC721',
              enum: ['ERC721', 'ERC1155'],
            },
            address: {
              title: 'Receiver address',
              description: 'Filter by receiver address',
              type: 'string',
            },
            contractaddress: {
              title: 'Token address',
              description: 'Filter by token contract address',
              type: 'string',
            },
          },
        },
        validate: (inputs: Record<string, any>) => {
          if (!inputs.address && !inputs.contractaddress) {
            throw new Error('Either receiver address or token address must be provided.')
          }
          return true
        },
      },
    ],
  },
  {
    name: 'Webhook',
    logo: 'https://flowoid.s3.amazonaws.com/logos/webhook.svg',
    triggers: [
      {
        integrationKey: 'webhook',
        operationId: 'receiveWebhook',
        name: 'New webhook received',
        description: 'Triggered when a request is received on a specific URL',
      },
    ],
  },
  {
    name: 'Discord',
    logo: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/discord.svg',
    triggers: [
      {
        integrationKey: 'discord',
        operationId: 'newSlashCommandGuild',
        name: 'New slash command on a server Instant',
        description: 'Triggered when a slash command is sent on a server',
      },
    ],
  },
]

interface Props {
  onTriggerSelected: (trigger: IntegrationTrigger) => any
  onCredentialsSelected: (id: string) => any
  onSubmitTriggerInputs: (
    inputs: Record<string, any>,
    integrationTrigger: IntegrationTrigger,
    credentialsID?: string,
  ) => Promise<any>
  onViewAllTriggersClick: () => void
}

const integrationFragment = gql`
  fragment SelectPopularTriggerFragment on Integration {
    id
    key
    integrationAccount {
      ...SelectCredentials_IntegrationAccount
    }
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

export function SelectPopularTrigger({
  onTriggerSelected,
  onCredentialsSelected,
  onSubmitTriggerInputs,
  onViewAllTriggersClick,
}: Props) {
  const [accountCredentialId, setAccountCredentialId] = useState<string | null>(null)
  const [trigger, setTrigger] = useState<PopularTrigger | null>(null)
  const { data: integrationData, loading: loadingIntegrations } = useGetIntegrations(integrationFragment, {
    skip: !trigger?.integrationKey,
    variables: {
      filter: {
        key: {
          eq: trigger?.integrationKey,
        },
      },
    },
  })
  const integration = integrationData?.integrations.edges[0]?.node
  const integrationAccount = integration?.integrationAccount
  const { data: integrationTriggerData, loading: loadingIntegrationTriggers } = useGetIntegrationTriggers(
    SelectWorkflowNode.fragments.IntegrationTrigger,
    {
      skip: !trigger?.operationId || !integration,
      variables: {
        filter: {
          key: {
            eq: trigger?.operationId,
          },
          integration: {
            eq: integration?.id,
          },
        },
      },
    },
  )
  const integrationTrigger = integrationTriggerData?.integrationTriggers.edges[0]?.node

  useEffect(() => {
    if (trigger && integrationTrigger) {
      if (!integrationAccount) {
        onTriggerSelected(integrationTrigger)
        setTrigger(null) // ensure we don't submit twice
      } else if (integrationAccount && accountCredentialId) {
        onTriggerSelected(integrationTrigger)
        onCredentialsSelected(accountCredentialId)
        setTrigger(null) // ensure we don't submit twice
        setAccountCredentialId(null)
      }
    }
  }, [accountCredentialId, integrationAccount, integrationTrigger, onCredentialsSelected, onTriggerSelected, trigger])

  if (loadingIntegrations || loadingIntegrationTriggers) {
    return <Loading />
  }

  if (trigger?.schema) {
    return <SelectCustomPopularTrigger trigger={trigger} onSubmitTriggerInputs={onSubmitTriggerInputs} />
  }

  if (integrationAccount && !accountCredentialId) {
    return <SelectCredentials integrationAccount={integrationAccount} onCredentialsSelected={setAccountCredentialId} />
  }

  if (accountCredentialId) {
    return <Loading />
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {triggers.map((integration) => (
        <div key={integration.name} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <img src={integration.logo} alt={integration.name} className="w-8 h-8" />
              <span className="text-lg">{integration.name}</span>
            </div>
          </div>
          <List
            itemLayout="horizontal"
            size="small"
            bordered
            dataSource={integration.triggers}
            renderItem={(node) => (
              <List.Item className="cursor-pointer hover:bg-blue-50 hover:shadow-sm" onClick={() => setTrigger(node)}>
                <List.Item.Meta
                  title={node.name}
                  description={
                    <Typography.Paragraph ellipsis={{ rows: 2 }} type="secondary">
                      {node.description}
                    </Typography.Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ))}
      <div className="mt-12 text-center">
        <Button onClick={onViewAllTriggersClick}>View all triggers</Button>
      </div>
    </div>
  )
}
