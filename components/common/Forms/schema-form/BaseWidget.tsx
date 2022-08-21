import React, { useState } from 'react'

import { WidgetProps } from '@rjsf/core'
import { Button, Col, Row, Tooltip } from 'antd'
import { InputProps } from 'antd/es/input'
import Input from 'antd/lib/input'
import { ImMagicWand } from 'react-icons/im'
import { assertNever } from '../../../../src/utils/typescript.utils'
import { SelectNodeOutputs } from './SelectNodeOutputs'

// Based on:
//   https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/antd/src/widgets/TextWidget/index.js
//   https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/antd/src/widgets/TextareaWidget/index.js

const INPUT_STYLE = {
  width: '100%',
  borderRadius: '2px 0 0 2px',
}

type WidgetType = 'text' | 'password' | 'url' | 'email' | 'textarea'

export const BaseWidget = ({
  // autofocus,
  disabled,
  formContext,
  id,
  // label,
  onBlur,
  onChange,
  onFocus,
  options,
  placeholder,
  readonly,
  // required,
  schema,
  value,
  widgetType,
}: WidgetProps & { widgetType: WidgetType }) => {
  const [inputValue, setInputValue] = useState(value)
  const [addingOutputs, setAddingOutputs] = useState(false)
  const { outputs, readonlyAsDisabled = true } = formContext
  const isNumberInput = schema.type === 'number' || schema.type === 'integer'

  const parseValue = (value: string | number | boolean | null) => (isNumberInput ? Number(value) || null : value)

  const handleTextChange = ({ target }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = target.value === '' ? options.emptyValue : parseValue(target.value)
    onChange(newValue)
    setInputValue(newValue)
  }

  const handleBlur = ({ target }: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onBlur(id, parseValue(target.value))
    setAddingOutputs(false)
  }

  const handleFocus = ({ target }: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFocus(id, parseValue(target.value))
  }

  const handleSelectOutputClick = () => {
    setAddingOutputs(true)
  }

  const handleOutputSelect = (output: string) => {
    const newValue = (inputValue || '') + `{{${output}}}`
    onChange(newValue)
    setInputValue(newValue)
    setAddingOutputs(false)
  }

  let inputType: string
  let autoComplete = 'off' // Otherwise the suggestions are displayed above the "Add outputs" popover
  switch (widgetType) {
    case 'text':
      inputType = isNumberInput ? 'number' : (options.inputType as InputProps['type']) || 'text'
      break
    case 'password':
      inputType = 'password'
      autoComplete = 'new-password'
      break
    case 'url':
      inputType = 'url'
      break
    case 'email':
      inputType = 'email'
      break
    case 'textarea':
      inputType = 'textarea'
      break
    default:
      assertNever(widgetType)
      inputType = ''
  }

  const inputElement =
    inputType === 'textarea' ? (
      <Input.TextArea
        autoComplete={autoComplete}
        disabled={disabled || (readonlyAsDisabled && readonly)}
        id={id}
        name={id}
        onChange={!readonly ? handleTextChange : undefined}
        onBlur={!readonly ? handleBlur : undefined}
        onFocus={!readonly ? handleFocus : undefined}
        placeholder={placeholder}
        style={INPUT_STYLE}
        value={inputValue}
        autoSize={{ minRows: options.rows ? Number(options.rows) : 4 }}
        // max length break with output injection
        // maxLength={schema.maxLength}
        // showCount={!!schema.maxLength}
      />
    ) : (
      <Input
        autoComplete={autoComplete}
        disabled={disabled || (readonlyAsDisabled && readonly)}
        id={id}
        name={id}
        onChange={!readonly ? handleTextChange : undefined}
        onBlur={!readonly ? handleBlur : undefined}
        onFocus={!readonly ? handleFocus : undefined}
        placeholder={placeholder}
        style={INPUT_STYLE}
        type={inputType}
        value={inputValue}
      />
    )

  return (
    <>
      {outputs.length ? (
        <Row>
          <Col xs={23}>{inputElement}</Col>
          <Col xs={1}>
            <Tooltip title="Add outputs from previous operations" placement="left">
              <Button
                type="primary"
                style={{ borderRadius: '0 2px 2px 0' }}
                icon={<ImMagicWand />}
                onClick={handleSelectOutputClick}
              />
            </Tooltip>
          </Col>
        </Row>
      ) : (
        inputElement
      )}
      {/* {schema.description && (
          <Typography.Paragraph type="secondary" ellipsis={{ rows: 1, expandable: true, symbol: 'more' }}>
            {schema.description}
          </Typography.Paragraph>
        )} */}
      <SelectNodeOutputs
        outputs={outputs}
        onSelectOutput={handleOutputSelect}
        onCancel={() => setAddingOutputs(false)}
        visible={addingOutputs}
      />
    </>
  )
}
