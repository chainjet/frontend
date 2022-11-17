import { DownOutlined } from '@ant-design/icons'
import { WidgetProps } from '@rjsf/utils'
import { Dropdown } from 'antd'
import { InputProps } from 'antd/es/input'
import Input from 'antd/lib/input'
import React, { useEffect, useRef, useState } from 'react'
import { assertNever } from '../../../../src/utils/typescript.utils'
import { NodeOutputsTree } from './NodeOutputsTree'

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
  const [outputSelectorOpen, setOutputSelectorOpen] = useState(false)
  const { outputs, readonlyAsDisabled = true } = formContext
  const wrapperRef = useRef<any>(null)
  const treeRef = useRef<any>(null)

  // close output selector on clicks outside this component
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !treeRef.current?.contains?.(event.target)
      ) {
        setOutputSelectorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // inputs with type number don't allow for output interpolation
  const isNumberInput = false // schema.type === 'number' || schema.type === 'integer'

  const parseValue = (value: string | number | boolean | null) => (isNumberInput ? Number(value) || null : value)

  const handleTextChange = ({ target }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = target.value === '' ? options.emptyValue : parseValue(target.value)
    onChange(newValue)
    setInputValue(newValue)
  }

  const handleBlur = ({ target }: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onBlur(id, parseValue(target.value))
  }

  const handleFocus = ({ target }: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFocus(id, parseValue(target.value))
    setOutputSelectorOpen(true)
  }

  const handleOutputSelect = (output: string) => {
    const newValue = (inputValue || '') + `{{${output}}}`
    onChange(newValue)
    setInputValue(newValue)
    setOutputSelectorOpen(false)
  }

  let inputType: string
  let autoComplete = 'disabled' // chrome sometimes ignores autocomplete="off" (i.e. when label includes address)

  // don't use html5 validations because they won't work with interpolation
  switch (widgetType) {
    case 'text':
    case 'url':
    case 'email':
      inputType = isNumberInput ? 'number' : (options.inputType as InputProps['type']) || 'text'
      break
    case 'password':
      inputType = 'password'
      autoComplete = 'new-password'
      break
    case 'textarea':
      inputType = 'textarea'
      break
    default:
      assertNever(widgetType)
      inputType = ''
  }

  placeholder = placeholder || (outputs.length ? 'Enter text and/or select a dynamic value' : '')

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
        suffix={outputs.length && <DownOutlined />}
      />
    )

  const nodeOutputsTree = (
    <div className="h-0">
      <div className="p-2 bg-white shadow-2xl" ref={treeRef}>
        <NodeOutputsTree outputs={outputs} onSelectOutput={handleOutputSelect} />
      </div>
    </div>
  )

  return (
    <div ref={wrapperRef}>
      {outputs.length && !(schema as any)['x-noInterpolation'] ? (
        <>
          <Dropdown
            overlay={nodeOutputsTree}
            open={outputSelectorOpen}
            placement="bottom"
            getPopupContainer={wrapperRef ? () => wrapperRef.current : undefined}
          >
            <a onClick={(e) => e.preventDefault()}>{inputElement}</a>
          </Dropdown>
        </>
      ) : (
        inputElement
      )}
      {/* {schema.description && (
          <Typography.Paragraph type="secondary" ellipsis={{ rows: 1, expandable: true, symbol: 'more' }}>
            {schema.description}
          </Typography.Paragraph>
        )} */}
    </div>
  )
}
