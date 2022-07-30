import React from 'react'
import { List, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

interface Props {
  visible: boolean
  onTriggerSelected: () => void
  onActionSelected: () => void
  onClose: () => void
}

export const AddTriggerActionModal = (props: Props) => {
  const { visible, onTriggerSelected, onActionSelected, onClose } = props

  const data = [{
    key: 'trigger',
    title: <><PlusOutlined/> Add a trigger</>,
    description: '(Optional) A trigger will run your workflow when certain conditions are met. ' +
      'Workflows without trigger can be run manually or invoked from other workflows.',
  }, {
    key: 'action',
    title: <><PlusOutlined/> Add an action</>,
    description: 'Actions perform specific tasks when the workflow is run. ' +
      'Your workflow can contain any number of actions.',
  }]

  const onOptionSelected = (key: string) => {
    if (key === 'trigger') {
      onTriggerSelected()
    } else {
      onActionSelected()
    }
    onClose()
  }

  return (
    <Modal
      visible={visible}
      title="Add the first trigger or action"
      onCancel={onClose}
      footer={null}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item onClick={() => onOptionSelected(item.key)} className="list-item">
            <List.Item.Meta
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}
