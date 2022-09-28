import { gql } from '@apollo/client'
import { Alert } from 'antd'
import { useEffect, useState } from 'react'
import { IntegrationTrigger } from '../../../../graphql'
import { useGetIntegrations } from '../../../../src/services/IntegrationHooks'
import { useGetIntegrationTriggers } from '../../../../src/services/IntegrationTriggerHooks'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { Loading } from '../../../common/RequestStates/Loading'
import { SelectCredentials } from '../steps/SelectCredentials'
import { SelectWorkflowNode } from '../steps/SelectWorkflowNode'
import { PopularTrigger } from './types'

interface Props {
  trigger: PopularTrigger
  onSubmitTriggerInputs: (
    inputs: Record<string, any>,
    integrationTrigger: IntegrationTrigger,
    credentialsID?: string,
  ) => Promise<any>
}

const integrationFragment = gql`
  fragment SelectCustomPopularTriggerFragment on Integration {
    id
    key
    integrationAccount {
      ...SelectCredentials_IntegrationAccount
    }
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

export function SelectCustomPopularTrigger({ trigger, onSubmitTriggerInputs }: Props) {
  const [triggerData, setTriggerData] = useState<PopularTrigger | null>(null)
  const [triggerInputs, setTriggerInputs] = useState<Record<string, any>>({})
  const [createTriggerError, setCreateTriggerError] = useState<Error | null>()
  const [accountCredentialId, setAccountCredentialId] = useState<string | null>(null)
  const { data: integrationData, loading: loadingIntegrations } = useGetIntegrations(integrationFragment, {
    skip: !triggerData?.integrationKey,
    variables: {
      filter: {
        key: {
          eq: triggerData?.integrationKey,
        },
      },
    },
  })
  const integration = integrationData?.integrations.edges[0]?.node
  const integrationAccount = integration?.integrationAccount
  const { data: integrationTriggerData, loading: loadingIntegrationTriggers } = useGetIntegrationTriggers(
    SelectWorkflowNode.fragments.IntegrationTrigger,
    {
      skip: !triggerData?.operationId || !integration,
      variables: {
        filter: {
          key: {
            eq: triggerData?.operationId,
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
    if (triggerData && integrationTrigger) {
      if (!integrationAccount) {
        onSubmitTriggerInputs(triggerInputs, integrationTrigger)
        setTriggerData(null) // ensure we don't submit twice
      } else if (accountCredentialId) {
        onSubmitTriggerInputs(triggerInputs, integrationTrigger, accountCredentialId)
        setTriggerData(null) // ensure we don't submit twice
        setAccountCredentialId(null)
      }
    }
  }, [accountCredentialId, integrationAccount, integrationTrigger, onSubmitTriggerInputs, triggerData, triggerInputs])

  const handleSchemaFormSubmit = async (inputs: Record<string, any>) => {
    setCreateTriggerError(null)
    setTriggerInputs(inputs)
    if (trigger?.validate) {
      try {
        trigger.validate(inputs)
      } catch (e) {
        setCreateTriggerError(e as Error)
        return
      }
    }
    if (trigger?.getIntegrationKey) {
      trigger.integrationKey = trigger.getIntegrationKey(inputs)
    }
    if (trigger?.getOperationId) {
      trigger.operationId = trigger.getOperationId(inputs)
    }
    setTriggerData(trigger)
  }

  if (loadingIntegrations || loadingIntegrationTriggers) {
    return <Loading />
  }

  if (integrationAccount) {
    return <SelectCredentials integrationAccount={integrationAccount} onCredentialsSelected={setAccountCredentialId} />
  }

  return (
    <div>
      <SchemaForm schema={trigger.schema} initialInputs={{}} onSubmit={handleSchemaFormSubmit} />
      {createTriggerError && (
        <div className="mt-8">
          <Alert message={createTriggerError.message} type="error" showIcon />
        </div>
      )}
    </div>
  )
}
