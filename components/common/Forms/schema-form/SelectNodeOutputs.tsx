import React from 'react'
import { WorkflowOutput } from '../../../../src/typings/Workflow'
import { DownOutlined } from '@ant-design/icons'
import { Avatar, Modal, Tree } from 'antd'
import { DataNode, Key } from 'rc-tree/lib/interface'
import { JSONSchema7, JSONSchema7TypeName } from 'json-schema'

interface Props {
  visible: boolean
  outputs: WorkflowOutput[]
  onSelectOutput: (key: string) => void
  onCancel: () => void
}

export const SelectNodeOutputs = (props: Props) => {
  const { visible, outputs, onSelectOutput, onCancel } = props

  const handleOutputSelect = (selectedKeys: Key[]) => {
    if (
      selectedKeys[0] &&
      typeof selectedKeys[0] === 'string' &&
      selectedKeys[0].includes('.')
    ) {
      onSelectOutput(selectedKeys[0])
    }
  }

  const treeData: DataNode[] = outputs.map(output => ({
    key: output.nodeId,
    title: (
      <>
        {output.nodeLogo && <Avatar src={output.nodeLogo} size='small' />}{' '}
        {output.nodeName}
      </>
    ),
    children: createOutputsTree(output.schema, output.nodeId)
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
      />
    </Modal>
  )
}

export function createOutputsTree (
  schema: JSONSchema7,
  parentKey: string
): DataNode[] {
  return Object.entries(schema?.properties || {})
    .filter(([_, value]) => {
      if (typeof value === 'boolean') {
        return false
      }
      // remove null properties (type = 'null' or ['null'])
      return !(
        value.type === 'null' ||
        (value.type?.length === 1 && value.type[0] === 'null')
      )
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
            $ref: undefined
          }
        }
      }

      const dataNode: DataNode = {
        key: `${parentKey}.${key}`,
        title: key // property.title || key
      }
      const propertyType = (typeof property.type === 'string'
        ? [property.type]
        : property.type) as JSONSchema7TypeName[] | undefined
      if (
        propertyType?.find(type =>
          ['string', 'number', 'boolean', 'integer'].includes(type)
        )
      ) {
        return dataNode
      }
      if (propertyType?.includes('array')) {
        return dataNode // TODO
      }
      return {
        ...dataNode,
        children: createOutputsTree(property, '' + dataNode.key)
      }
    })
}
