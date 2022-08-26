import { cloneDeep } from '@apollo/client/utilities'
import { UiSchema, WidgetProps, withTheme } from '@rjsf/core'
import { Button } from 'antd'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import { JSONSchema7 } from 'json-schema'
import Head from 'next/head'
import { useEffect } from 'react'
import { jsonSchemaDefinitions } from '../../../../src/json-schema/jsonSchemaDefinitions'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { isEmptyObj } from '../../../../src/utils/object.utils'
import { extractUISchema, fixArraysWithoutItems, removeHiddenProperties } from '../../../../src/utils/schema.utils'
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

export const SchemaForm = (props: Props) => {
  const { schema, initialInputs, parentOutputs, loading, loadingSchema, onChange, onSubmit, onError } = props

  // Prepare Json Schema
  let formSchema = cloneDeep(schema) ?? {}

  formSchema.definitions = {
    ...(formSchema.definitions ?? {}),
    ...jsonSchemaDefinitions,
  }

  formSchema = removeHiddenProperties(formSchema) as JSONSchema7
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
  let formData: any

  return (
    <>
      <Head>
        <link rel="stylesheet" id="theme" href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.22.4/antd.min.css" />
      </Head>
      <ThemedForm
        schema={formSchema}
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
          onChange?.(data.formData)
          formData = data.formData
        }}
        // Skip validation for objects inside arrays due to bug:
        //   - https://github.com/flowoid/flowoid/issues/32
        //   - https://github.com/rjsf-team/react-jsonschema-form/issues/2103
        transformErrors={(errors) => {
          return errors.filter((error) => !error.property.match(/\[\d+\]/))
        }}
      >
        {loadingSchema ? (
          <Loading />
        ) : (
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        )}
      </ThemedForm>
    </>
  )
}
