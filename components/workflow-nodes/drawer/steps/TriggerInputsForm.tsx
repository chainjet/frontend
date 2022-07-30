import React from 'react'
import { Loading } from '../../../common/RequestStates/Loading'
import { gql } from '@apollo/client'
import { JSONSchema7 } from 'json-schema'
import { RequestError } from '../../../common/RequestStates/RequestError'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { useGetIntegrationTriggerById } from '../../../../src/services/IntegrationTriggerHooks'
import { IntegrationTrigger } from '../../../../graphql'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { jsonSchemaDefinitions } from '../../../../src/json-schema/jsonSchemaDefinitions'
import { retrocycle } from '../../../../src/utils/json.utils'

type TriggerInputs = Record<string, any>

interface Props {
  trigger: IntegrationTrigger
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
  }
`

export function TriggerInputsForm (props: Props) {
  const { trigger, extraSchemaProps, onSubmitOperationInputs } = props
  const { data, loading, error } = useGetIntegrationTriggerById(triggerInputsFormFragment, {
    variables: {
      id: trigger.id
    }
  })

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
        ...(schema.properties ?? {})
      },
    }
  }

  let initialInputs = props.initialInputs
  if (!data.integrationTrigger.instant) {
    schema = {
      ...schema,
      properties: {
        chainjet_schedule: {
          $ref: '#/definitions/chainjet_schedule'
        },
        ...(schema.properties ?? {}),
      },
      required: ['chainjet_schedule', ...(schema.required ?? [])]
    }

    // Uses a different title for the Schedule Trigger and the trigger scheduling options
    // We could do something nicer extending the schema with allOf
    // But this issue is preventing us from using it: https://github.com/rjsf-team/react-jsonschema-form/issues/2071
    if (data.integrationTrigger.key === 'schedule') {
      jsonSchemaDefinitions.chainjet_schedule.properties.frequency.title = 'Run Workflow'
    } else {
      jsonSchemaDefinitions.chainjet_schedule.properties.frequency.title = 'Check trigger'
    }

    // Initialize chainjet_schedule if it's not defined
    if (isEmptyObj(initialInputs?.chainjet_schedule || {})) {
      initialInputs = initialInputs || {}
      initialInputs.chainjet_schedule = {
        frequency: 'interval',
        interval: 300
      }
    }
  }

  return (
    <SchemaForm schema={schema}
      initialInputs={initialInputs}
      onSubmit={onSubmitOperationInputs} />
  )
}
