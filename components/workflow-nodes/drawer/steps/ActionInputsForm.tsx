import { gql } from '@apollo/client'
import { isAddress } from '@ethersproject/address'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import { useEffect, useState } from 'react'
import { useGetAccountCredentialById } from '../../../../src/services/AccountCredentialHooks'
import { useGetIntegrationActionById } from '../../../../src/services/IntegrationActionHooks'
import { useLazyGetContractSchema } from '../../../../src/services/SmartContractHooks'
import { useGetWorkflowsActions } from '../../../../src/services/WorkflowActionHooks'
import { useGetWorkflowTriggerById } from '../../../../src/services/WorkflowTriggerHooks'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { retrocycle } from '../../../../src/utils/json.utils'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { DisplayError } from '../../../common/RequestStates/DisplayError'
import { Loading } from '../../../common/RequestStates/Loading'
import { RequestError } from '../../../common/RequestStates/RequestError'

type ActionInputs = { [key: string]: any }

interface Props {
  integrationActionId: string
  workflowTriggerId: string | undefined
  parentActionIds: string[]
  accountCredentialId: string | undefined
  initialInputs: ActionInputs
  extraSchemaProps?: JSONSchema7
  onSubmitActionInputs: (inputs: ActionInputs) => any
}

const actionInputsFormFragment = gql`
  fragment ActionInputsForm on IntegrationAction {
    id
    key
    schemaRequest
  }
`

const triggerFragment = gql`
  fragment ActionInputsFormTrigger on WorkflowTrigger {
    id
    schemaResponse
    integrationTrigger {
      name
      schemaResponse
      integration {
        id
        logo
      }
    }
    credentials {
      id
      schemaRefs
    }
  }
`

const actionFragment = gql`
  fragment ActionInputsFormAction on WorkflowAction {
    id
    schemaResponse
    integrationAction {
      name
      schemaResponse
      integration {
        id
        logo
      }
    }
    credentials {
      id
      schemaRefs
    }
  }
`

const credentialsFragment = gql`
  fragment ActionInputsFormCredentials on AccountCredential {
    id
    schemaRefs
  }
`

export function ActionInputsForm(props: Props) {
  const {
    integrationActionId,
    workflowTriggerId,
    parentActionIds,
    accountCredentialId,
    initialInputs,
    extraSchemaProps,
    onSubmitActionInputs,
  } = props

  const [inputs, setInputs] = useState(initialInputs)
  const { data, loading, error } = useGetIntegrationActionById(actionInputsFormFragment, {
    variables: {
      id: integrationActionId,
    },
  })
  const triggerRes = useGetWorkflowTriggerById(triggerFragment, {
    skip: !workflowTriggerId,
    variables: {
      id: workflowTriggerId!,
    },
  })
  const actionRes = useGetWorkflowsActions(actionFragment, {
    skip: !parentActionIds.length,
    variables: {
      filter: {
        id: {
          in: parentActionIds,
        },
      },
    },
  })
  const credentialsRes = useGetAccountCredentialById(credentialsFragment, {
    skip: !accountCredentialId,
    variables: {
      id: accountCredentialId ?? '',
    },
  })
  const [getContractSchema, { data: contractSchemaData, loading: contractSchemaLoading, error: contractSchemaError }] =
    useLazyGetContractSchema()

  const integrationAction = data?.integrationAction

  useEffect(() => {
    if (
      integrationAction?.key === 'readContract' &&
      inputs.network &&
      isAddress(inputs.address) &&
      (!contractSchemaData ||
        (contractSchemaData.chainId !== inputs.network && contractSchemaData.address !== inputs.address))
    ) {
      getContractSchema({
        variables: {
          chainId: inputs.network,
          address: inputs.address,
          type: 'read-methods',
        },
      })
    }
  }, [inputs])

  if (loading || triggerRes.loading || actionRes.loading) {
    return <Loading />
  }
  if (error || !integrationAction?.schemaRequest) {
    return <RequestError error={error} />
  }

  const trigger = triggerRes.data?.workflowTrigger
  const parentWorkflowActions = actionRes.data?.workflowActions.edges?.map((action) => action.node) || []
  const accountCredential = credentialsRes.data?.accountCredential

  const parentOutputs: WorkflowOutput[] = []
  if (trigger) {
    let schema: JSONSchema7
    if (trigger.schemaResponse) {
      schema = deepmerge(trigger.schemaResponse, trigger.integrationTrigger.schemaResponse ?? {})
    } else {
      schema = trigger.integrationTrigger.schemaResponse
    }
    // Add definitions from account credentials
    schema = {
      ...schema,
      definitions: {
        ...(schema.definitions ?? {}),
        ...(trigger.credentials?.schemaRefs ?? {}),
      },
    }
    parentOutputs.push({
      nodeId: trigger.id,
      nodeName: trigger.integrationTrigger.name,
      nodeLogo: trigger.integrationTrigger.integration.logo,
      schema,
    })
  }
  parentWorkflowActions.forEach((action) => {
    // Add definitions from account credentials
    const schema = {
      ...action.integrationAction.schemaResponse,
      ...(action.schemaResponse ?? {}),
      definitions: {
        ...(action.integrationAction.schemaResponse?.definitions ?? {}),
        ...(action.schemaResponse?.definitions ?? {}),
        ...(action.credentials?.schemaRefs ?? {}),
      },
    }
    parentOutputs.push({
      nodeId: action.id,
      nodeName: action.integrationAction.name,
      nodeLogo: action.integrationAction.integration.logo,
      schema,
    })
  })

  let schema = retrocycle(integrationAction.schemaRequest) as JSONSchema7
  if (extraSchemaProps?.properties) {
    schema = {
      ...schema,
      required: [...(extraSchemaProps.required ?? []), ...(schema.required ?? [])],
      properties: {
        ...extraSchemaProps.properties,
        ...(schema.properties ?? {}),
      },
    }
  }
  if (!isEmptyObj(accountCredential?.schemaRefs ?? {})) {
    schema = {
      ...schema,
      definitions: {
        ...(schema.definitions ?? {}),
        ...accountCredential?.schemaRefs,
      },
    }
  }

  // TODO hack for Smart Contracts integration
  //      there should be a property in the integration to define this requirement
  const onChange = (data: Record<string, any>) => {
    if (
      data.network &&
      isAddress(data.address) &&
      (data.network !== inputs.network || data.address !== inputs.address)
    ) {
      setInputs({
        ...inputs,
        ...data,
      })
    }
  }

  if (contractSchemaData?.contractSchema?.schema) {
    schema = deepmerge(schema, contractSchemaData.contractSchema.schema ?? {})
  }

  return (
    <>
      <SchemaForm
        schema={schema}
        initialInputs={inputs}
        parentOutputs={parentOutputs}
        onSubmit={onSubmitActionInputs}
        onChange={onChange}
      />
      {contractSchemaLoading && <Loading />}
      {contractSchemaError && <DisplayError error={contractSchemaError} />}
    </>
  )
}
