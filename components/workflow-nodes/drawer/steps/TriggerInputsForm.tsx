import { gql } from '@apollo/client'
import { isAddress } from '@ethersproject/address'
import { Alert } from 'antd'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import { useEffect, useState } from 'react'
import { jsonSchemaDefinitions } from '../../../../src/json-schema/jsonSchemaDefinitions'
import { useGetAsyncSchemas } from '../../../../src/services/AsyncSchemaHooks'
import { useGetIntegrationTriggerById } from '../../../../src/services/IntegrationTriggerHooks'
import { useLazyGetContractSchema } from '../../../../src/services/SmartContractHooks'
import { retrocycle } from '../../../../src/utils/json.utils'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { getSchemaDefaults, isSelectInput, mergePropSchema } from '../../../../src/utils/schema.utils'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { Loading } from '../../../common/RequestStates/Loading'
import { RequestError } from '../../../common/RequestStates/RequestError'

type TriggerInputs = Record<string, any>

interface Props {
  triggerId: string
  accountCredentialId: string | undefined
  initialInputs: TriggerInputs
  extraSchemaProps?: JSONSchema7
  onSubmitOperationInputs: (inputs: TriggerInputs) => Promise<any>
  onChange?: (inputs: Record<string, any>) => any
  hideSubmit?: boolean
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

export function TriggerInputsForm({
  triggerId,
  accountCredentialId,
  initialInputs,
  extraSchemaProps,
  onSubmitOperationInputs,
  onChange,
  hideSubmit,
}: Props) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
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
  const asyncSchemas: Array<{ name: string; dependencies?: string[]; any?: boolean }> =
    integrationTrigger?.schemaRequest?.['x-asyncSchemas']
  const asyncSchemaNames = asyncSchemas?.map((prop: { name: string }) => prop.name) ?? []

  const asyncSchemaRes = useGetAsyncSchemas({
    skip: !integrationTrigger?.schemaRequest || !asyncSchemaNames.length,
    variables: {
      integrationId: integrationTrigger?.integration.id ?? '',
      accountCredentialId: accountCredentialId ?? '',
      names: asyncSchemaNames,
      integrationTriggerId: integrationTrigger?.id,
      inputs: dependencyInputs,
    },
  })

  // update inputs if initial inputs has an external change
  useEffect(() => {
    setInputs(initialInputs)
  }, [initialInputs])

  // add schema defaults to dependency inputs
  useEffect(() => {
    setDependencyInputs(deepmerge(getSchemaDefaults(integrationTrigger?.schemaRequest ?? {}), initialInputs))
  }, [initialInputs, integrationTrigger?.schemaRequest])

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
      try {
        getContractSchema({
          variables: {
            chainId: inputs.network,
            address: inputs.address,
            type: 'events',
          },
        })
      } catch (e) {
        console.log(`ERROR ===>`, e)
      }
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

  if (contractSchemaData?.contractSchema?.schema) {
    schema = deepmerge(schema, contractSchemaData.contractSchema.schema ?? {})
  }

  const onFormChange = (data: Record<string, any>) => {
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

    // x-asyncSchema props with any = true refresh properties on any change
    // for performance we are only doing this for selects
    const hasPropWithAnyEnabled = asyncSchemas?.some((prop) => prop.any)

    const selectKeys = Object.keys(data).filter((key) => isSelectInput(key, schema))

    // keys with at least one dependency listening
    const dependencyKeys = asyncSchemas
      ? (Array.from(new Set(asyncSchemas.map((prop) => prop.dependencies).flat())).filter((key) => !!key) as string[])
      : []

    // keys that if updated, we refresh asyncSchemas
    const keyChanges = hasPropWithAnyEnabled ? selectKeys : dependencyKeys

    // update inputs for asyncSchemas dependencies
    // TODO wait ~500ms for the user to end typing
    let changed = false
    let newInputs: Record<string, any> = { ...dependencyInputs }
    for (const key of keyChanges) {
      if (data[key] !== dependencyInputs[key]) {
        changed = true
      }
      newInputs[key] = data[key]
    }
    if (changed) {
      setDependencyInputs(newInputs)
      setInputs(newInputs)
    }

    // trigger onChange for any change
    onChange?.(data)
  }

  const onFormSubmit = async (data: Record<string, any>) => {
    setSubmitLoading(true)
    setSubmitError(null)
    try {
      await onSubmitOperationInputs(data)
    } catch (e: any) {
      setSubmitError(e.message ?? 'Unknown error')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <>
      <SchemaForm
        schema={schema}
        initialInputs={inputs}
        onChange={onFormChange}
        onSubmit={onFormSubmit}
        loading={submitLoading}
        hideSubmit={hideSubmit}
      />
      {contractSchemaLoading && <Loading />}
      {(submitError ?? contractSchemaError) && (
        <div className="mt-8">
          <Alert
            type="error"
            message="Error executing the trigger:"
            description={submitError ?? contractSchemaError?.message}
            showIcon
          />
        </div>
      )}
    </>
  )
}
