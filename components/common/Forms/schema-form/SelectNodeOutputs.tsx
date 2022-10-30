import { DownOutlined } from '@ant-design/icons'
import { Modal, Tree } from 'antd'
import { JSONSchema7, JSONSchema7TypeName } from 'json-schema'
import { DataNode, Key } from 'rc-tree/lib/interface'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { TypeColor } from '../../TypeColor'

interface Props {
  visible: boolean
  outputs: WorkflowOutput[]
  onSelectOutput: (key: string) => void
  onCancel: () => void
}

export const SelectNodeOutputs = ({ visible, outputs, onSelectOutput, onCancel }: Props) => {
  const handleOutputSelect = (selectedKeys: Key[]) => {
    if (selectedKeys[0] && typeof selectedKeys[0] === 'string' && selectedKeys[0].includes('.')) {
      onSelectOutput(selectedKeys[0])
    }
  }

  const treeData: DataNode[] = outputs.map((output) => ({
    key: output.nodeId,
    title: (
      <>
        {output.nodeLogo && <img src={output.nodeLogo} width={24} height={24} alt={output.nodeName} />}{' '}
        {output.nodeName}
      </>
    ),
    children: createOutputsTree(output.schema, output.nodeId, output.lastItem),
  }))

  return (
    <Modal visible={visible} onOk={onCancel} onCancel={onCancel} footer={null}>
      <Tree
        height={500}
        showLine
        switcherIcon={<DownOutlined />}
        defaultExpandAll={true}
        onSelect={handleOutputSelect}
        treeData={treeData}
        selectedKeys={[]}
      />
    </Modal>
  )
}

export function createOutputsTree(schema: JSONSchema7, parentKey: string, lastItem?: Record<string, any>): DataNode[] {
  return Object.entries(schema?.properties || {})
    .filter(([_, value]) => {
      if (typeof value === 'boolean') {
        return false
      }
      // remove null properties (type = 'null' or ['null'])
      return !(value.type === 'null' || (value.type?.length === 1 && value.type[0] === 'null'))
    })
    .map(([key, value]) => {
      let property = value as JSONSchema7

      // Copy schema from $ref into the property
      if (property.$ref) {
        const refPath = property.$ref.split('/').slice(1)
        if (refPath.length) {
          let refValue: JSONSchema7 = schema
          for (const key of refPath) {
            refValue = refValue[key as keyof JSONSchema7] as JSONSchema7
          }
          property = {
            ...property,
            ...refValue,
            $ref: undefined,
          }
        }
      }

      const dataNode: DataNode = {
        key: `${parentKey}.${key}`,
        title:
          lastItem &&
          lastItem?.[key] !== undefined &&
          (!lastItem[key] || !['', '[object Object]'].includes(lastItem[key].toString().trim())) ? (
            <>
              <strong>{key}</strong>: <TypeColor value={lastItem[key]} />
            </>
          ) : (
            <strong>{key}</strong>
          ),
      }
      const propertyType = (typeof property.type === 'string' ? [property.type] : property.type) as
        | JSONSchema7TypeName[]
        | undefined
      if (propertyType?.find((type) => ['string', 'number', 'boolean', 'integer'].includes(type))) {
        return dataNode
      }
      if (propertyType?.includes('array')) {
        if (!property.items || property.items === true) {
          return dataNode
        }
        if (Array.isArray(property.items)) {
          return dataNode // TODO
        }
        return {
          ...dataNode,
          title: `${key} <list>`,
          children: createOutputsTree(property.items, '' + dataNode.key + '[0]', lastItem?.[key]?.[0]),
        }
      }
      return {
        ...dataNode,
        children: createOutputsTree(property, '' + dataNode.key, lastItem?.[key]),
      }
    })
}
