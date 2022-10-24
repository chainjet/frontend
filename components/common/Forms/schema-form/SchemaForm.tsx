import { cloneDeep } from '@apollo/client/utilities'
import { withTheme } from '@rjsf/core'
import { UiSchema, WidgetProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv6'
import { Button } from 'antd'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import Head from 'next/head'
import { useEffect } from 'react'
import { jsonSchemaDefinitions } from '../../../../src/json-schema/jsonSchemaDefinitions'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { extractUISchema, fixArraysWithoutItems, removeHiddenProperties } from '../../../../src/utils/schema.utils'
import { hasInterpolation } from '../../../../src/utils/strings'
import { Loading } from '../../RequestStates/Loading'
import { BaseWidget } from './BaseWidget'
import TitleField from './TitleField'
require('./SchemaForm.less')

const { Theme } = require('@rjsf/antd')
const ThemedForm = withTheme(Theme)

type OperationInputs = Record<string, any>

// Needed until this issue is closed https://github.com/react-component/picker/issues/123
dayjs.extend(weekday)
dayjs.extend(localeData)

interface Props {
  schema: any
  initialInputs: OperationInputs
  parentOutputs?: WorkflowOutput[]
  loading?: boolean
  loadingSchema?: boolean
  hideSubmit?: boolean
  submitButtonText?: string
  onChange?: (inputs: OperationInputs) => any
  onSubmit: (inputs: OperationInputs) => any
  onError?: () => any
}

// Widgets must be defined outside SchemaForm to prevent rerendering issues
export const TextWidget = (props: WidgetProps) => {
  return <BaseWidget {...props} widgetType="text" />
}

export const PasswordWidget = (props: WidgetProps) => {
  return <BaseWidget {...props} widgetType="password" />
}

export const URLWidget = (props: WidgetProps) => {
  return <BaseWidget {...props} widgetType="url" />
}

export const EmailWidget = (props: WidgetProps) => {
  return <BaseWidget {...props} widgetType="email" />
}

export const TextareaWidget = (props: WidgetProps) => {
  return <BaseWidget {...props} widgetType="textarea" />
}

export const SchemaForm = ({
  schema,
  initialInputs,
  parentOutputs,
  loading,
  loadingSchema,
  hideSubmit,
  submitButtonText,
  onChange,
  onSubmit,
  onError,
}: Props) => {
  // Prepare Json Schema
  let formSchema = cloneDeep(schema) ?? {}

  formSchema.definitions = {
    ...(formSchema.definitions ?? {}),
    ...jsonSchemaDefinitions,
  }

  formSchema = removeHiddenProperties(formSchema)
  formSchema = fixArraysWithoutItems(formSchema)

  let formIsEmpty = !formSchema || isEmptyObj(formSchema.properties ?? {})

  // auto-submit empty forms
  useEffect(() => {
    if (formIsEmpty) {
      onSubmit({})
    }
  }, [])

  if (formIsEmpty) {
    return <></>
  }

  const uiSchema: UiSchema = extractUISchema(formSchema) ?? {}

  // Sort required properties first
  if (!uiSchema['ui:order'] && formSchema.required) {
    uiSchema['ui:order'] = [...formSchema.required, '*']
  }

  const outputs = parentOutputs || []
  let formData: Record<string, any> = initialInputs || {}

  return (
    <>
      <Head>
        <link rel="stylesheet" id="theme" href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.23.2/antd.min.css" />
      </Head>
      <ThemedForm
        schema={formSchema}
        validator={validator}
        uiSchema={uiSchema}
        formData={initialInputs}
        formContext={{ outputs }}
        widgets={{
          TextWidget,
          PasswordWidget,
          URLWidget,
          EmailWidget,
          TextareaWidget,
        }}
        fields={{
          TitleField,
        }}
        onSubmit={(args: any) => onSubmit(args.formData)}
        onError={onError ? onError : () => {}}
        onChange={(data) => {
          // stringify numbers greater than the max safe integer
          for (const [key, value] of Object.entries(data.formData)) {
            if (typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
              data.formData[key] = value.toString()
            }
          }

          onChange?.(data.formData)
          formData = data.formData
        }}
        transformErrors={(errors) => {
          return (
            errors
              // filter out errors on fields that have interpolation (foo is not a valid email but {{trigger.email}} might be)
              .filter((error) => {
                if (error.property) {
                  const value = formData[error.property.slice(1)] ?? ''
                  return !hasInterpolation(value)
                }
                return true
              })
              // filter out errors for stringified numbers
              .filter((error) => {
                if (error.property && ['should be number', 'should be integer'].includes(error.message ?? '')) {
                  const value = formData[error.property.slice(1)]
                  return !Number.isFinite(Number(value))
                }
                return true
              })
              // filter out validation for objects inside arrays due to an open issue in rjsf
              //   https://github.com/rjsf-team/react-jsonschema-form/issues/2103
              .filter((error) => error.property && !error.property.match(/\[\d+\]/))
          )
        }}
      >
        {loadingSchema ? (
          <Loading />
        ) : hideSubmit ? (
          <></>
        ) : (
          <Button type="primary" htmlType="submit" loading={loading}>
            {submitButtonText ?? 'Submit'}
          </Button>
        )}
      </ThemedForm>
    </>
  )
}
