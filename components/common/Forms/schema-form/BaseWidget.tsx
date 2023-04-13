import { DownOutlined } from '@ant-design/icons'
import { WidgetProps } from '@rjsf/utils'
import { Dropdown, Select, Tag } from 'antd'
import Input, { InputProps } from 'antd/lib/input'
import React, { useEffect, useRef, useState } from 'react'
import { assertNever } from '../../../../src/utils/typescript.utils'
import { NodeOutputsTree } from './NodeOutputsTree'
import { SelectOutputsDropdown } from './SelectOutputsDropdown'

const INPUT_STYLE = {
  width: '100%',
  borderRadius: '2px 0 0 2px',
}

type WidgetType = 'text' | 'password' | 'url' | 'email' | 'textarea' | 'select'

export const BaseWidget = ({
  // autofocus,
  disabled,
  formContext,
  id,
  label,
  onBlur,
  onChange,
  onFocus,
  options,
  placeholder,
  readonly,
  required,
  schema,
  value,
  widgetType,
  multiple,
}: WidgetProps & { widgetType: WidgetType }) => {
  const [inputValue, setInputValue] = useState(value)
  const [outputSelectorOpen, setOutputSelectorOpen] = useState(false)

  // if a select input is using one of the options (not interpolation or custom)
  const [displaySelectLabel, setDisplaySelectLabel] = useState(
    widgetType === 'select' && options.enumOptions?.some((option) => option.value === value),
  )

  const { outputs, readonlyAsDisabled = true } = formContext
  const wrapperRef = useRef<any>(null)
  const treeRef = useRef<any>(null)

  // update state when input value changes in parent component
  useEffect(() => {
    setInputValue(value)
    setDisplaySelectLabel(widgetType === 'select' && options.enumOptions?.some((option) => option.value === value))
  }, [value, widgetType, options.enumOptions])

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

  const handleTextChange = (elem: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string[]) => {
    const value = Array.isArray(elem) ? elem.join('') : elem.target.value
    const newValue = value === '' ? options.emptyValue : parseValue(value)
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

  const handleOutputSelect = (output: string, isExactOption: boolean = false) => {
    let newValue: string
    if (isExactOption) {
      // a select option was selected
      newValue = output
    } else if (displaySelectLabel) {
      // a custom value was entered after a select option
      newValue = `{{${output}}}`
    } else {
      newValue = (inputValue || '') + `{{${output}}}`
    }
    setDisplaySelectLabel(isExactOption)
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
    case 'select':
      inputType = 'select'
      break
    default:
      assertNever(widgetType)
      inputType = ''
  }

  const showInterpolationDropdown: boolean = outputs.length && !(schema as any)['x-noInterpolation']

  placeholder =
    placeholder ||
    (outputs.length
      ? `Enter a text or click to see available values${
          schema.examples ? `.${inputType === 'textarea' ? '\n' : ' '}Example: ${schema.examples}` : ''
        }`
      : schema.examples
      ? `Example: ${schema.examples}`
      : '')

  const inputElement =
    inputType === 'select' && displaySelectLabel ? (
      <Select
        id={id}
        disabled={disabled || (readonlyAsDisabled && readonly)}
        onChange={!readonly ? handleTextChange : undefined}
        onBlur={!readonly ? handleBlur : undefined}
        onFocus={!readonly ? handleFocus : undefined}
        placeholder="Select and option or use a custom value"
        style={INPUT_STYLE}
        className="caret-transparent"
        mode="tags"
        allowClear
        value={inputValue}
        defaultValue={[inputValue] as any}
        open={false}
        labelInValue
        removeIcon={required ? <></> : undefined}
        showArrow
        tagRender={(tag) => {
          const option = options.enumOptions?.find((opt) => opt.value === tag.value)
          const label = option?.label || tag.value
          return (
            <Tag closable={!required} onClose={tag.onClose}>
              <strong className="text-sm">{label}</strong>
              {label !== tag.value && <span className="ml-2 text-gray-400">{tag.value}</span>}
            </Tag>
          )
        }}
      />
    ) : inputType === 'textarea' ? (
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
        suffix={showInterpolationDropdown && <DownOutlined />}
      />
    )

  if (inputType === 'select') {
    const { enumOptions, enumDisabled } = options
    const selectNodeOutputsTree = (
      <div className="h-0">
        <div className="px-2 mt-2 bg-white shadow-2xl" ref={treeRef}>
          <SelectOutputsDropdown
            label={label}
            value={inputValue}
            enumOptions={enumOptions ?? []}
            enumDisabled={enumDisabled ?? []}
            multiple={multiple}
            outputs={outputs}
            showCustom={showInterpolationDropdown}
            onSelectOutput={handleOutputSelect}
          />
        </div>
      </div>
    )

    return (
      <div ref={wrapperRef}>
        <Dropdown
          overlay={selectNodeOutputsTree}
          open={outputSelectorOpen}
          placement="bottom"
          getPopupContainer={wrapperRef ? () => wrapperRef.current : undefined}
        >
          <a onClick={(e) => e.preventDefault()}>{inputElement}</a>
        </Dropdown>
      </div>
    )
  }

  const nodeOutputsTree = (
    <div className="h-0">
      <div className={`p-2 bg-white shadow-2xl ${inputType !== 'textarea' ? 'mt-2' : ''}`} ref={treeRef}>
        <NodeOutputsTree outputs={outputs} onSelectOutput={handleOutputSelect} />
      </div>
    </div>
  )

  return (
    <div ref={wrapperRef}>
      {showInterpolationDropdown ? (
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
