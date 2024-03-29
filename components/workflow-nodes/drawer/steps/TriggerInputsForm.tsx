import { gql } from '@apollo/client'
import { Alert } from 'antd'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import { Ref, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { defaultPlan, plansConfig } from '../../../../src/constants/plans.config'
import { useGetAsyncSchemas } from '../../../../src/services/AsyncSchemaHooks'
import { useGetIntegrationTriggerById } from '../../../../src/services/IntegrationTriggerHooks'
import { useViewer } from '../../../../src/services/UserHooks'
import { retrocycle } from '../../../../src/utils/json.utils'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { getSchemaDefaults, isSelectInput, mergePropSchema } from '../../../../src/utils/schema.utils'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { Loading } from '../../../common/RequestStates/Loading'
import { RequestError } from '../../../common/RequestStates/RequestError'

type TriggerInputs = Record<string, any>

export interface TriggerInputsFormRef {
  getInputs: () => TriggerInputs
}

interface Props {
  triggerId: string
  accountCredentialId: string | undefined
  initialInputs: TriggerInputs
  extraSchemaProps?: JSONSchema7
  readonly?: boolean
  onSubmitOperationInputs: (inputs: TriggerInputs) => Promise<any>
  getInputsCallback?: (inputs: Record<string, any>) => any
  hideSubmit?: boolean
  hidePolling?: boolean
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

export const TriggerInputsForm = forwardRef(
  (
    {
      triggerId,
      accountCredentialId,
      initialInputs,
      extraSchemaProps,
      readonly,
      onSubmitOperationInputs,
      hideSubmit,
      hidePolling,
    }: Props,
    ref: Ref<TriggerInputsFormRef>,
  ) => {
    const { viewer, loading: viewerLoading } = useViewer()
    const [submitLoading, setSubmitLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const { data, loading, error } = useGetIntegrationTriggerById(triggerInputsFormFragment, {
      variables: {
        id: triggerId,
      },
    })
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

    // add schema defaults to dependency inputs
    useEffect(() => {
      setDependencyInputs(deepmerge(getSchemaDefaults(integrationTrigger?.schemaRequest ?? {}), initialInputs))
    }, [initialInputs, integrationTrigger?.schemaRequest])

    useEffect(() => {
      // Initialize chainjet_schedule if it's not defined
      if (
        integrationTrigger &&
        !integrationTrigger.instant &&
        integrationTrigger.key === 'schedule' &&
        viewer &&
        !hidePolling
      ) {
        if (isEmptyObj(inputs?.chainjet_schedule || {})) {
          setInputs({
            ...inputs,
            chainjet_schedule: {
              frequency: 'interval',
              interval: Math.max(plansConfig[viewer.plan ?? defaultPlan].minPollingInterval, 300),
            },
          })
        }
      }
    }, [inputs, integrationTrigger, viewer, hidePolling])

    // support to get inputs from parent without using onChange
    useImperativeHandle(
      ref,
      () => ({
        getInputs: () => inputs,
      }),
      [inputs],
    )

    if (loading || viewerLoading) {
      return <Loading />
    }
    if (error || !data?.integrationTrigger?.schemaRequest) {
      return <RequestError error={error} />
    }

    let schema = retrocycle(data.integrationTrigger.schemaRequest) as JSONSchema7

    if (!data.integrationTrigger.instant && !hidePolling) {
      if (data.integrationTrigger.key === 'schedule') {
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
      } else {
        schema = {
          ...schema,
          properties: {
            chainjet_poll_interval: {
              $ref: '#/definitions/chainjet_poll_interval',
            },
            ...(schema.properties ?? {}),
          },
          required: ['chainjet_poll_interval', ...(schema.required ?? [])],
        }
      }
    }

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

    // merge async schemas
    if (!isEmptyObj(asyncSchemaRes?.data?.asyncSchemas.schemas ?? {})) {
      schema = mergePropSchema(schema, asyncSchemaRes?.data?.asyncSchemas.schemas!)
    }
    if (!isEmptyObj(asyncSchemaRes?.data?.asyncSchemas.schemaExtension ?? {})) {
      schema = deepmerge(schema, asyncSchemaRes?.data?.asyncSchemas.schemaExtension!)
    }

    const onFormChange = (data: Record<string, any>) => {
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
      }

      setInputs(data)
    }

    const onFormSubmit = async (data: Record<string, any>) => {
      setSubmitLoading(true)
      setSubmitError(null)
      setInputs(data)
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
          loading={submitLoading || asyncSchemaRes?.loading}
          hideSubmit={hideSubmit}
          readonly={readonly}
        />
        {(submitError ?? asyncSchemaRes?.error) && (
          <div className="mt-8">
            <Alert
              type="error"
              message={submitError ? 'Error executing the trigger:' : 'Error fetching schema:'}
              description={submitError ?? asyncSchemaRes.error?.message}
              showIcon
            />
          </div>
        )}
      </>
    )
  },
)
