import { Alert, Button } from 'antd'
import { JSONSchema7 } from 'json-schema'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Integration, Project } from '../../../graphql'
import { useCreateWorkflowWithOperations } from '../../../src/services/WizardHooks'
import { getEtherscanNetworkSchema, getExplorerUrlForIntegration } from '../../../src/utils/blockchain.utils'
import { SchemaForm } from '../../common/Forms/schema-form/SchemaForm'
import { IntegrationNotificationStep } from './IntegrationNotificationStep'

export function TransactionNotificationStep({ projects }: { projects: Project[] }) {
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
    if (workflow?.slug && workflowActions?.length) {
      router.push(`/${workflow.slug}`)
    }
  }, [router, workflow, workflowActions])

  const schema: JSONSchema7 = {
    type: 'object',
    required: projects.length > 1 ? ['project', 'network', 'address'] : ['network', 'address'],
    properties: {
      ...(projects.length > 1
        ? {
            project: {
              title: 'Project',
              type: 'string',
              default: projects[0].id,
              oneOf: projects.map((project) => ({ title: project.name, const: project.id })),
            },
          }
        : {}),
      network: getEtherscanNetworkSchema(),
      address: {
        title: 'Receiver address',
        description: 'The address to get the transactions for',
        type: 'string',
      },
    },
  }

  const getWorkflowActionData = (key: string) => {
    switch (key) {
      case 'email':
        return {
          key: 'sendEmailToYourself',
          inputs: {
            subject: `New transaction on ${inputs.address}`,
            body:
              `There was a transaction on an address you are watching.\n\n` +
              `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
        }
      case 'discord':
        return {
          key: 'sendMessage',
          inputs: {
            channelId: inputs.channelId,
            content: `New transaction:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
          credentialsId,
        }
      case 'telegram-bot':
        return {
          key: 'telegram_bot_api-send-text-message-or-reply',
          inputs: {
            chatId: inputs.chatId,
            text: `New transaction:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
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
    if (!notificationIntegration) {
      setError('Please select an integration')
      return
    }
    setError(null)
    try {
      await createWorflowWithOperations({
        projectId: inputs.project ?? projects[0].id,
        workflowName: 'Send notification when a transaction occurs',
        integration: {
          key: inputs.network,
        },
        trigger: {
          key: 'listTransactions',
          inputs: {
            ...inputs,
            project: undefined,
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
