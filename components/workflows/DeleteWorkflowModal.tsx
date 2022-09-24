import { WarningOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Workflow } from '../../graphql'
import { useDeleteOneWorkflow } from '../../src/services/WorkflowHooks'
import { DeleteConfirmationModal } from '../common/Modals/DeleteConfirmationModal'

interface Props {
  workflow: Workflow
  visible: boolean
  onDeleteWorkflow: (id: string) => any
  onCancel: () => any
}

export const DeleteWorkflowModal = (props: Props) => {
  const { workflow, visible, onDeleteWorkflow, onCancel } = props
  const [deleteWorkflow] = useDeleteOneWorkflow()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteWorkflow({
      variables: {
        input: {
          id: workflow.id,
        },
      },
    })
    setLoading(false)
    onDeleteWorkflow(workflow.id)
  }

  return (
    <DeleteConfirmationModal
      message={
        <>
          Are you sure you want to delete the workflow <strong>{workflow.name}</strong>?<br />
          <br />
          <WarningOutlined /> This action cannot be undone.
        </>
      }
      visible={visible}
      onDelete={handleDelete}
      onCancel={onCancel}
      loading={loading}
    />
  )
}
