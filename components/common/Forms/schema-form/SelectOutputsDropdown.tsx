import { EnumOptionsType } from '@rjsf/utils'
import { Radio, Space, Tabs } from 'antd'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { NodeOutputsTree } from './NodeOutputsTree'

interface Props {
  label: string
  value: string
  enumOptions: EnumOptionsType[]
  enumDisabled: Array<string | number | boolean>
  outputs: WorkflowOutput[]
  multiple: boolean | undefined
  showCustom: boolean
  onSelectOutput: (key: string, isExactOption?: boolean) => void
}

/**
 * Render the outputs dropdown for inputs type 'select'.
 * These have 2 tabs for selecting options of the select, or entering a custom expression
 */
export function SelectOutputsDropdown({
  label,
  value,
  enumOptions,
  // enumDisabled, // TODO
  outputs,
  // multiple, // TODO
  showCustom,
  onSelectOutput,
}: Props) {
  const selectOptions = (
    <div style={{ maxHeight: 350 }} className="overflow-scroll">
      <Radio.Group value={value} onChange={(e) => onSelectOutput(e.target.value, true)}>
        <Space direction="vertical">
          {enumOptions.map(({ value: optionValue, label: optionLabel, schema }) => (
            <Radio key={optionValue} value={optionValue} disabled={schema?.readOnly}>
              <div>
                <strong>{optionLabel}</strong>
              </div>
              <div className="text-gray-400">{optionValue}</div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  )

  if (!showCustom) {
    return <div className="py-2">{selectOptions}</div>
  }

  const items = [
    { label: `Select ${label}`, key: 'select', children: selectOptions },
    {
      label: 'Custom',
      key: 'custom',
      children: <NodeOutputsTree outputs={outputs} onSelectOutput={onSelectOutput} />,
    },
  ]
  return <Tabs items={items} />
}
