import { gql } from '@apollo/client'
import { Alert, Button } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Integration, Project } from '../../../graphql'
import { ChainId, NETWORK } from '../../../src/constants/networks'
import { useGetIntegrations } from '../../../src/services/IntegrationHooks'
import { useGetIntegrationTriggers } from '../../../src/services/IntegrationTriggerHooks'
import { useCreateWorkflowWithOperations } from '../../../src/services/WizardHooks'
import { Loading } from '../../common/RequestStates/Loading'
import { TriggerInputsForm } from '../../workflow-nodes/drawer/steps/TriggerInputsForm'
import { IntegrationNotificationStep } from './IntegrationNotificationStep'

const integrationFragment = gql`
  fragment EventNotificationStepIntegrationFragment on Integration {
    id
    key
  }
`

const integrationTriggerFragment = gql`
  fragment EventNotificationStepIntegrationTriggerFragment on IntegrationTrigger {
    id
    key
  }
`

export function EventNotificationStep({ projects }: { projects: Project[] }) {
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
  const { data: integrationData, loading: integrationLoading } = useGetIntegrations(integrationFragment, {
    variables: {
      filter: {
        key: { eq: 'blockchain' },
      },
    },
  })
  const integration = integrationData?.integrations?.edges?.[0]?.node
  const { data: integrationTriggerData, loading: integrationTriggerLoading } = useGetIntegrationTriggers(
    integrationTriggerFragment,
    {
      skip: !integration?.id,
      variables: {
        filter: {
          integration: { eq: integration?.id },
          key: { eq: 'newEvent' },
        },
      },
    },
  )
  const integrationTrigger = integrationTriggerData?.integrationTriggers?.edges?.[0]?.node

  useEffect(() => {
    if (workflow?.slug && workflowActions?.length) {
      router.push(`/${workflow.slug}`)
    }
  }, [router, workflow, workflowActions])

  const getWorkflowActionData = (key: string) => {
    switch (key) {
      case 'email':
        return {
          key: 'sendEmailToYourself',
          inputs: {
            subject: `New {{trigger.eventName}} on ${inputs.address}`,
            body:
              `There was a new {{trigger.eventName}} event on an address you are watching.\n\n` +
              `View it on ${NETWORK[inputs.network as ChainId]?.explorerUrl}/tx/{{trigger.transactionHash}}`,
          },
        }
      case 'discord':
        return {
          key: 'sendMessage',
          inputs: {
            channelId: inputs.channelId,
            content:
              `New {{trigger.eventName}}:\n` +
              `${NETWORK[inputs.network as ChainId]?.explorerUrl}/tx/{{trigger.transactionHash}}`,
          },
          credentialsId,
        }
      case 'telegram-bot':
        return {
          key: 'telegram_bot_api-send-text-message-or-reply',
          inputs: {
            chatId: inputs.chatId,
            text:
              `New {{trigger.eventName}}:\n` +
              `${NETWORK[inputs.network as ChainId]?.explorerUrl}/tx/{{trigger.transactionHash}}`,
          },
          credentialsId,
        }
    }
    throw new Error(`Invalid integration key: ${key}`)
  }

  const onIntegrationChange = (integration: Integration, credentialsId?: string, extraInputs?: Record<string, any>) => {
    setNotificationIntegration(integration)
    setCredentialsId(credentialsId)
    setChangedInputs(extraInputs ?? {})
  }

  const setChangedInputs = (changedInputs: Record<string, any>) => {
    const inputsChanged = Object.keys(changedInputs).some((key) => changedInputs[key] !== inputs[key])
    if (inputsChanged) {
      setInputs({ ...inputs, ...changedInputs })
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
        workflowName: 'Send notification when an event is emitted',
        integration: {
          key: 'blockchain',
        },
        trigger: {
          key: 'newEvent',
          inputs: {
            ...inputs,
            project: undefined,
          },
        },
        actions: [getWorkflowActionData(notificationIntegration.key)],
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (!integrationTrigger) {
    return <Loading />
  }

  return (
    <>
      <TriggerInputsForm
        triggerId={integrationTrigger.id}
        accountCredentialId={undefined}
        initialInputs={inputs}
        onChange={setChangedInputs}
        onSubmitOperationInputs={onFormSubmit}
        hideSubmit
      />
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
