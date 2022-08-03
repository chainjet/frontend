import React, { useState } from 'react'
import { DeleteConfirmationModal } from '../../common/Modals/DeleteConfirmationModal'
import { useDeleteOneWorkflowAction } from '../../../src/services/WorkflowActionHooks'

interface Props {
  workflowActionId: string
  workflowActionName: string
  visible: boolean
  onDeleteWorkflowAction: (id: string) => any
  onCancel: () => any
}

export const DeleteWorkflowActionModal = (props: Props) => {
  const { workflowActionId, workflowActionName, visible, onDeleteWorkflowAction, onCancel } = props
  const [deleteWorkflowAction] = useDeleteOneWorkflowAction()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteWorkflowAction({
      variables: {
        input: {
          id: workflowActionId,
        },
      },
    })
    setLoading(false)
    onDeleteWorkflowAction(workflowActionId)
  }

  return (
    <DeleteConfirmationModal
      message={
        <>
          Are you sure you want to delete action <strong>{workflowActionName}</strong>
        </>
      }
      visible={visible}
      onDelete={handleDelete}
      onCancel={onCancel}
      loading={loading}
    />
  )
}
