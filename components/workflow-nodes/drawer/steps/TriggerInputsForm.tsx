import { gql } from '@apollo/client'
import { isAddress } from '@ethersproject/address'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import { useEffect, useState } from 'react'
import { jsonSchemaDefinitions } from '../../../../src/json-schema/jsonSchemaDefinitions'
import { useGetAsyncSchemas } from '../../../../src/services/AsyncSchemaHooks'
import { useGetIntegrationTriggerById } from '../../../../src/services/IntegrationTriggerHooks'
import { useLazyGetContractSchema } from '../../../../src/services/SmartContractHooks'
import { retrocycle } from '../../../../src/utils/json.utils'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { mergePropSchema } from '../../../../src/utils/schema.utils'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { DisplayError } from '../../../common/RequestStates/DisplayError'
import { Loading } from '../../../common/RequestStates/Loading'
import { RequestError } from '../../../common/RequestStates/RequestError'

type TriggerInputs = Record<string, any>

interface Props {
  triggerId: string
  accountCredentialId: string | undefined
  initialInputs: TriggerInputs
  extraSchemaProps?: JSONSchema7
  onSubmitOperationInputs: (inputs: TriggerInputs) => any
}

const triggerInputsFormFragment = gql`
  fragment TriggerInputsFormFragment on IntegrationTrigger {
    id
    key
    schemaRequest
    instant
    integration {
      id
    }
  }
`

export function TriggerInputsForm(props: Props) {
  const { triggerId, extraSchemaProps, onSubmitOperationInputs, accountCredentialId, initialInputs } = props
  const { data, loading, error } = useGetIntegrationTriggerById(triggerInputsFormFragment, {
    variables: {
      id: triggerId,
    },
  })
  const [getContractSchema, { data: contractSchemaData, loading: contractSchemaLoading, error: contractSchemaError }] =
    useLazyGetContractSchema()
  const [inputs, setInputs] = useState(initialInputs)
  const [dependencyInputs, setDependencyInputs] = useState(initialInputs)

  const integrationTrigger = data?.integrationTrigger
  const asyncSchemas: Array<{ name: string; dependencies: string[] }> =
    integrationTrigger?.schemaRequest?.['x-asyncSchemas']
  const asyncSchemaNames = asyncSchemas?.map((prop: { name: string }) => prop.name) ?? []

  // inputs based on dependencies
  const dependencyKeys = asyncSchemas
    ? Array.from(new Set(asyncSchemas.map((prop) => prop.dependencies).flat())).filter((key) => !!key)
    : []

  const asyncSchemaRes = useGetAsyncSchemas({
    skip: !integrationTrigger?.id || !asyncSchemaNames.length,
    variables: {
      integrationId: integrationTrigger?.integration.id ?? '',
      accountCredentialId: accountCredentialId ?? '',
      names: asyncSchemaNames,
      integrationTriggerId: integrationTrigger?.id,
      inputs: dependencyInputs,
    },
  })

  useEffect(() => {
    // Initialize chainjet_schedule if it's not defined
    if (integrationTrigger && !integrationTrigger.instant) {
      if (isEmptyObj(inputs?.chainjet_schedule || {})) {
        setInputs({
          ...inputs,
          chainjet_schedule: {
            frequency: 'interval',
            interval: 300,
          },
        })
      }
    }

    if (
      integrationTrigger?.key === 'newEvent' &&
      inputs.network &&
      isAddress(inputs.address) &&
      (!contractSchemaData ||
        (contractSchemaData.chainId !== inputs.network && contractSchemaData.address !== inputs.address))
    ) {
      getContractSchema({
        variables: {
          chainId: inputs.network,
          address: inputs.address,
          type: 'events',
        },
      })
    }
  }, [inputs, integrationTrigger])

  if (loading) {
    return <Loading />
  }
  if (error || !data?.integrationTrigger?.schemaRequest) {
    return <RequestError error={error} />
  }

  let schema = retrocycle(data.integrationTrigger.schemaRequest) as JSONSchema7
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

  if (!data.integrationTrigger.instant) {
    schema = {
      ...schema,
      properties: {
        chainjet_schedule: {
          $ref: '#/definitions/chainjet_schedule',
        },
        ...(schema.properties ?? {}),
      },
      required: ['chainjet_schedule', ...(schema.required ?? [])],
    }

    // Uses a different title for the Schedule Trigger and the trigger scheduling options
    // We could do something nicer extending the schema with allOf
    // But this issue is preventing us from using it: https://github.com/rjsf-team/react-jsonschema-form/issues/2071
    if (data.integrationTrigger.key === 'schedule') {
      jsonSchemaDefinitions.chainjet_schedule.properties.frequency.title = 'Run Workflow'
    } else {
      jsonSchemaDefinitions.chainjet_schedule.properties.frequency.title = 'Check trigger'
    }
  }

  if (!isEmptyObj(asyncSchemaRes?.data?.asyncSchemas.schemas ?? {})) {
    schema = mergePropSchema(schema, asyncSchemaRes?.data?.asyncSchemas.schemas!)
  }

  const onChange = (data: Record<string, any>) => {
    // TODO hack for Smart Contracts integration
    //      migrate it to use asyncSchemas
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

    // update inputs for asyncSchemas dependencies
    let changed = false
    let newDependencyInputs: Record<string, any> = {}
    for (const key of dependencyKeys) {
      if (data[key] !== dependencyInputs[key]) {
        changed = true
      }
      newDependencyInputs[key] = data[key]
    }
    if (changed) {
      setDependencyInputs(newDependencyInputs)
    }
  }

  if (contractSchemaData?.contractSchema?.schema) {
    schema = deepmerge(schema, contractSchemaData.contractSchema.schema ?? {})
  }

  return (
    <>
      <SchemaForm schema={schema} initialInputs={inputs} onSubmit={onSubmitOperationInputs} onChange={onChange} />
      {contractSchemaLoading && <Loading />}
      {contractSchemaError && <DisplayError error={contractSchemaError} />}
    </>
  )
}
