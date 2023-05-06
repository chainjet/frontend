import { gql } from '@apollo/client'
import { Alert, Button } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { Integration } from '../../../graphql'
import { NotificationTrigger } from '../../../src/constants/notification-triggers'
import { useGetIntegrations } from '../../../src/services/IntegrationHooks'
import { useGetIntegrationTriggers } from '../../../src/services/IntegrationTriggerHooks'
import { useCreateWorkflowWithOperations } from '../../../src/services/WizardHooks'
import { SchemaForm } from '../../common/Forms/schema-form/SchemaForm'
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

interface Props {
  notificationTrigger: NotificationTrigger
  readonly?: boolean
}

export function NotificationStep({ notificationTrigger, readonly }: Props) {
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [credentialsId, setCredentialsId] = useState<string>()
  const [notificationIntegration, setNotificationIntegration] = useState<Integration>()
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()
  const {
    createWorflowWithOperations,
    workflow,
    workflowActions,
    loading,
    error: createError,
  } = useCreateWorkflowWithOperations()
  const router = useRouter()

  // notification triggers without schema need to fetch from the integration trigger
  const schemaDefined = !!notificationTrigger.schema
  const integrationTriggerKeys = useMemo(() => notificationTrigger.triggerData({}), [notificationTrigger])
  const { data: integrationData } = useGetIntegrations(integrationFragment, {
    skip: schemaDefined,
    variables: {
      filter: {
        key: { eq: integrationTriggerKeys.integrationKey },
      },
    },
  })
  const integration = integrationData?.integrations?.edges?.[0]?.node
  const { data: integrationTriggerData } = useGetIntegrationTriggers(integrationTriggerFragment, {
    skip: !integration?.id,
    variables: {
      filter: {
        integration: { eq: integration?.id },
        key: { eq: integrationTriggerKeys.operationKey },
      },
    },
  })
  const integrationTrigger = integrationTriggerData?.integrationTriggers?.edges?.[0]?.node

  useEffect(() => {
    if (workflow?.id && workflowActions?.length) {
      router.push(`/workflows/${workflow.id}?success=true`)
    }
  }, [router, workflow, workflowActions])

  const getWorkflowActionData = (key: string) => {
    const actionData = notificationTrigger.actionData(inputs)
    switch (key) {
      case 'email':
        if (!inputs.email) {
          throw new Error(`Email is required`)
        }
        return {
          key: 'sendEmailToYourself',
          inputs: {
            email: inputs.email,
            subject: actionData.email.subject,
            body: actionData.email.body,
          },
        }
      case 'discord':
        return {
          key: 'sendMessage',
          inputs: {
            channelId: inputs.channelId,
            content: actionData.message,
          },
          credentialsId,
        }
      case 'telegram-bot':
        return {
          key: 'telegram_bot_api-send-text-message-or-reply',
          inputs: {
            chatId: inputs.chatId,
            text: actionData.message,
          },
          credentialsId,
        }
      case 'xmtp':
        return {
          key: 'sendMessageWallet',
          inputs: {
            address,
            message: actionData.message,
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

    try {
      // throws exception if inputs are invalid
      notificationTrigger.validateInputs?.(inputs)
    } catch (e) {
      setError((e as Error).message)
      return
    }

    if (!notificationIntegration) {
      setError('Please select an integration')
      return
    }
    setError(null)
    try {
      const { integrationKey, operationKey } = notificationTrigger.triggerData(inputs)
      await createWorflowWithOperations({
        workflowName: notificationTrigger.workflowName,
        triggerIntegration: {
          key: integrationKey,
        },
        trigger: {
          key: operationKey,
          inputs: {
            ...inputs,
          },
          ...(notificationTrigger.instantTrigger
            ? {}
            : {
                schedule: {
                  frequency: 'interval',
                  interval: 900,
                },
              }),
        },
        actions: [getWorkflowActionData(notificationIntegration.key)],
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <>
      {schemaDefined ? (
        <div className="mb-8">
          <SchemaForm
            schema={notificationTrigger.schema}
            initialInputs={inputs}
            hideSubmit
            onChange={setChangedInputs}
            onSubmit={onFormSubmit}
            readonly={readonly}
          />
        </div>
      ) : integrationTrigger ? (
        <TriggerInputsForm
          triggerId={integrationTrigger.id}
          accountCredentialId={undefined}
          initialInputs={inputs}
          onChange={setChangedInputs}
          onSubmitOperationInputs={onFormSubmit}
          hideSubmit
          readonly={readonly}
        />
      ) : (
        <Loading />
      )}
      <div className="mb-8">
        <IntegrationNotificationStep onIntegrationChange={onIntegrationChange} />
      </div>
      {(error ?? createError) && (
        <div className="mb-8">
          <Alert message={error ?? createError} type="error" showIcon />
        </div>
      )}
      <div className="mb-8">
        <Button type="primary" htmlType="submit" loading={loading} onClick={onFormSubmit} disabled={readonly}>
          Submit
        </Button>
      </div>
    </>
  )
}
