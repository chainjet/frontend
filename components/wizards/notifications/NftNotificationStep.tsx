import { Alert, Button } from 'antd'
import { JSONSchema7 } from 'json-schema'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Integration } from '../../../graphql'
import { useCreateWorkflowWithOperations } from '../../../src/services/WizardHooks'
import { getEtherscanNetworkSchema, getExplorerUrlForIntegration } from '../../../src/utils/blockchain.utils'
import { SchemaForm } from '../../common/Forms/schema-form/SchemaForm'
import { IntegrationNotificationStep } from './IntegrationNotificationStep'

export function NftNotificationStep() {
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [credentialsId, setCredentialsId] = useState<string>()
  const [notificationIntegration, setNotificationIntegration] = useState<Integration>()
  const [error, setError] = useState<string | null>(null)
  const {
    createWorflowWithOperations,
    workflow,
    workflowActions,
    loading,
    error: createError,
  } = useCreateWorkflowWithOperations()
  const router = useRouter()

  useEffect(() => {
    if (workflow?.id && workflowActions?.length) {
      router.push(`/workflows/${workflow.id}`)
    }
  }, [router, workflow, workflowActions])

  const schema: JSONSchema7 = {
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
  }

  const getWorkflowActionData = (key: string) => {
    switch (key) {
      case 'email':
        if (!inputs.email) {
          throw new Error(`Email is required`)
        }
        if (inputs.address) {
          return {
            key: 'sendEmailToYourself',
            inputs: {
              email: inputs.email,
              subject: `New NFT received on ${inputs.address}`,
              body:
                `A wallet you are watching just received an NFT.\n\n` +
                `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
            },
          }
        } else {
          return {
            key: 'sendEmailToYourself',
            inputs: {
              email: inputs.email,
              subject: `New NFT transfer`,
              body:
                `There was a transfer on an NFT you are watching.\n\n` +
                `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
            },
          }
        }
      case 'discord':
        return {
          key: 'sendMessage',
          inputs: {
            channelId: inputs.channelId,
            content: `New NFT transfer:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
          credentialsId,
        }
      case 'telegram-bot':
        return {
          key: 'telegram_bot_api-send-text-message-or-reply',
          inputs: {
            chatId: inputs.chatId,
            text: `New NFT transfer:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
          credentialsId,
        }
    }
    throw new Error(`Invalid integration key: ${key}`)
  }

  const onIntegrationChange = (integration: Integration, credentialsId?: string, extraInputs?: Record<string, any>) => {
    setNotificationIntegration(integration)
    setCredentialsId(credentialsId)

    // check if inputs have changed to avoid inifinte re-render
    const inputsChanged = Object.keys(extraInputs ?? {}).some((key) => extraInputs![key] !== inputs[key])
    if (inputsChanged) {
      setInputs({ ...inputs, ...(extraInputs ?? {}) })
    }
  }

  const onFormSubmit = async () => {
    if (!inputs) {
      return
    }
    if (!inputs.address && !inputs.contractaddress) {
      setError('Either receiver address or token address must be provided.')
      return
    }
    if (!notificationIntegration) {
      setError('Please select an integration')
      return
    }
    setError(null)
    try {
      await createWorflowWithOperations({
        workflowName: 'Send notification when an NFT is received',
        integration: {
          key: inputs.network,
        },
        trigger: {
          key: inputs.nftType === 'ERC1155' ? 'listERC1155TokenTransfers' : 'listERC721TokenTransfers',
          inputs: {
            ...inputs,
          },
          schedule: {
            frequency: 'interval',
            interval: 900,
          },
        },
        actions: [getWorkflowActionData(notificationIntegration.key)],
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="mb-8">
        <SchemaForm schema={schema} initialInputs={inputs} hideSubmit onChange={setInputs} onSubmit={onFormSubmit} />
      </div>
      <div className="mb-8">
        <IntegrationNotificationStep onIntegrationChange={onIntegrationChange} />
      </div>
      {(error ?? createError) && (
        <div className="mb-8">
          <Alert message={error ?? createError} type="error" showIcon />
        </div>
      )}
      <div className="mb-8">
        <Button type="primary" htmlType="submit" loading={loading} onClick={onFormSubmit}>
          Submit
        </Button>
      </div>
    </>
  )
}
