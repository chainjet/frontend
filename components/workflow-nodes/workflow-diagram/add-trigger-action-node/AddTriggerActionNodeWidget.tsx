import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { AddTriggerActionNodeModel } from './AddTriggerActionNodeModel'

interface AddTriggerActionNodeWidgetProps {
  node: AddTriggerActionNodeModel
}

export const AddTriggerActionNodeWidget = (props: AddTriggerActionNodeWidgetProps) => {
  const { node } = props

  return (
    <div className="custom-node">
      <Button
        size="large"
        type="dashed"
        onClick={() => node.nodeOptions.onCreateTriggerClick()}
        style={{ height: '60px', width: '280px' }}
      >
        <PlusOutlined /> <span className="text-xl">Add a trigger</span>
      </Button>
    </div>
  )
}
