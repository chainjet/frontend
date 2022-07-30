import React, { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { AddTriggerActionModal } from '../../modals/AddTriggerActionModal'
import { AddTriggerActionNodeModel } from './AddTriggerActionNodeModel'

interface AddTriggerActionNodeWidgetProps {
  node: AddTriggerActionNodeModel;
}

export const AddTriggerActionNodeWidget = (props: AddTriggerActionNodeWidgetProps) => {
  const { node } = props
  const [addTriggerActionModalOpen, setAddTriggerActionModalOpen] = useState(false)

  return (
    <div className="custom-node">
      <Button size="large"
              type="dashed"
              onClick={() => setAddTriggerActionModalOpen(true)}
              style={{ height: '120px' }}>
        <PlusOutlined/> Add a trigger or action
      </Button>

      <AddTriggerActionModal visible={addTriggerActionModalOpen}
                             onTriggerSelected={() => node.nodeOptions.onCreateTriggerClick()}
                             onActionSelected={() => node.nodeOptions.onCreateActionClick()}
                             onClose={() => setAddTriggerActionModalOpen(false)}/>
    </div>
  )
}
