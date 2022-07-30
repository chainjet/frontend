import React, { useState } from 'react'
import { DeleteConfirmationModal } from '../../common/Modals/DeleteConfirmationModal'
import { useDeleteOneWorkflowTrigger } from '../../../src/services/WorkflowTriggerHooks'

interface Props {
  workflowTriggerId: string
  workflowTriggerName: string
  visible: boolean
  onDeleteWorkflowTrigger: (id: string) => any
  onCancel: () => any
}

export const DeleteWorkflowTriggerModal = (props: Props) => {
  const { workflowTriggerId, workflowTriggerName, visible, onDeleteWorkflowTrigger, onCancel } = props
  const [deleteWorkflowTrigger] = useDeleteOneWorkflowTrigger()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteWorkflowTrigger({
      variables: {
        input: {
          id: workflowTriggerId
        }
      }
    })
    setLoading(false)
    onDeleteWorkflowTrigger(workflowTriggerId)
  }

  return (
    <DeleteConfirmationModal
      message={<>Are you sure you want to delete trigger <strong>{workflowTriggerName}</strong></>}
      visible={visible}
      onDelete={handleDelete}
      onCancel={onCancel}
      loading={loading}/>
  )
}
