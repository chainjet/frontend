import { gql } from '@apollo/client'
import { Alert, Button } from 'antd'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import { useEffect, useState } from 'react'
import { useGetAccountCredentialById } from '../../../../src/services/AccountCredentialHooks'
import { useGetAsyncSchemas } from '../../../../src/services/AsyncSchemaHooks'
import { useGetIntegrationActionById } from '../../../../src/services/IntegrationActionHooks'
import { useGetWorkflowsActions } from '../../../../src/services/WorkflowActionHooks'
import { useGetWorkflowTriggerById } from '../../../../src/services/WorkflowTriggerHooks'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { retrocycle } from '../../../../src/utils/json.utils'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { getSchemaDefaults, isSelectInput, mergePropSchema } from '../../../../src/utils/schema.utils'
import { capitalize } from '../../../../src/utils/strings'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { Loading } from '../../../common/RequestStates/Loading'
import { RequestError } from '../../../common/RequestStates/RequestError'

type ActionInputs = { [key: string]: any }

interface Props {
  action: 'create' | 'update'
  integrationActionId: string
  workflowTriggerId: string | undefined
  parentActionIds: string[]
  accountCredentialId: string | undefined
  initialInputs: ActionInputs
  extraSchemaProps?: JSONSchema7
  testError?: Error | undefined
  readonly?: boolean
  hideSubmit?: boolean
  onSubmitActionInputs: (inputs: ActionInputs, testAction: boolean) => Promise<any>
  onChange?: (inputs: Record<string, any>) => any
}

const actionInputsFormFragment = gql`
  fragment ActionInputsForm on IntegrationAction {
    id
    key
    schemaRequest
    integration {
      id
    }
  }
`

const triggerFragment = gql`
  fragment ActionInputsFormTrigger on WorkflowTrigger {
    id
    name
    schemaResponse
    lastItem
    integrationTrigger {
      instant
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
    name
    schemaResponse
    lastItem
    integrationAction {
      id
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

export function ActionInputsForm({
  action,
  integrationActionId,
  workflowTriggerId,
  parentActionIds,
  accountCredentialId,
  initialInputs,
  extraSchemaProps,
  testError,
  readonly,
  hideSubmit,
  onSubmitActionInputs,
  onChange,
}: Props) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  let testAction = false // using state causes unwanted re-rendering and inputs are not send correctly

  const [inputs, setInputs] = useState(initialInputs)
  const [dependencyInputs, setDependencyInputs] = useState(initialInputs)
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
      paging: {
        first: 120,
      },
    },
  })
  const credentialsRes = useGetAccountCredentialById(credentialsFragment, {
    skip: !accountCredentialId,
    variables: {
      id: accountCredentialId ?? '',
    },
  })
  const integrationAction = data?.integrationAction

  const asyncSchemas: Array<{ name: string; dependencies?: string[]; any?: boolean }> =
    integrationAction?.schemaRequest?.['x-asyncSchemas']
  const asyncSchemaNames = asyncSchemas?.map((prop: { name: string }) => prop.name) ?? []

  const asyncSchemaRes = useGetAsyncSchemas({
    skip: !integrationAction?.schemaRequest || !asyncSchemaNames.length,
    variables: {
      integrationId: integrationAction?.integration.id ?? '',
      accountCredentialId: accountCredentialId ?? '',
      names: asyncSchemaNames,
      integrationActionId,
      inputs: dependencyInputs,
    },
  })

  // add schema defaults to dependency inputs
  useEffect(() => {
    setDependencyInputs(deepmerge(getSchemaDefaults(integrationAction?.schemaRequest ?? {}), initialInputs))
  }, [initialInputs, integrationAction?.schemaRequest])

  // update inputs if initial inputs changes
  useEffect(() => {
    setInputs(initialInputs)
  }, [initialInputs])

  if (triggerRes.loading || actionRes.loading) {
    return <Loading />
  }
  if (triggerRes?.error || actionRes?.error! || !integrationAction?.schemaRequest) {
    return <RequestError error={triggerRes?.error ?? actionRes?.error} />
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
        ...(schema?.definitions ?? {}),
        ...(trigger.credentials?.schemaRefs ?? {}),
      },
    }
    parentOutputs.push({
      nodeId: 'trigger',
      nodeName: trigger.name,
      nodeLogo: trigger.integrationTrigger.integration.logo,
      schema,
      lastItem: trigger.lastItem,
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
      nodeName: action.name,
      nodeLogo: action.integrationAction.integration.logo,
      schema,
      lastItem: action.lastItem,
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
        ...(schema?.definitions ?? {}),
        ...accountCredential?.schemaRefs,
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

  const onInputsChange = (data: Record<string, any>) => {
    onChange?.(data)

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
  }

  const onFormSubmit = async (data: Record<string, any>) => {
    setSubmitLoading(true)
    setSubmitError(null)
    setInputs(data)
    try {
      await onSubmitActionInputs(data, testAction)
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
        parentOutputs={parentOutputs}
        loadingSchema={asyncSchemaRes?.loading}
        loading={submitLoading}
        readonly={readonly}
        onSubmit={onFormSubmit}
        onChange={onInputsChange}
        hideSubmit={hideSubmit}
        submitButtonText={capitalize(action)}
        submitButtons={
          !!workflowTriggerId && action === 'create' && (!trigger?.integrationTrigger.instant || trigger?.lastItem)
            ? (loading) => (
                <div className="flex flex-row gap-4">
                  <div>
                    <Button htmlType="submit" loading={loading} onClick={() => (testAction = false)}>
                      Skip test
                    </Button>
                  </div>
                  <div>
                    <Button type="primary" htmlType="submit" loading={loading} onClick={() => (testAction = true)}>
                      Test and create
                    </Button>
                  </div>
                </div>
              )
            : undefined
        }
      />
      {(submitError ?? testError ?? asyncSchemaRes?.error) && (
        <div className="mt-8">
          <Alert
            type="error"
            message={submitError ?? testError?.message ? 'Error executing the trigger:' : 'Error fetching schema:'}
            description={submitError ?? testError?.message ?? asyncSchemaRes?.error?.message}
            showIcon
          />
        </div>
      )}
    </>
  )
}
