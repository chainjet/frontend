import { WarningOutlined } from "@ant-design/icons"
import React, { useState } from "react"
import { Project } from "../../graphql"
import { useDeleteOneProject } from "../../src/services/ProjectHooks"
import { DeleteConfirmationModal } from "../common/Modals/DeleteConfirmationModal"

interface Props {
  project: Project
  visible: boolean
  onDeleteProject: (id: string) => any
  onCancel: () => any
}

export const DeleteProjectModal = (props: Props) => {
  const { project, visible, onDeleteProject, onCancel } = props
  const [deleteProject] = useDeleteOneProject()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteProject({
      variables: {
        input: {
          id: project.id
        }
      }
    })
    setLoading(false)
    onDeleteProject(project.id)
  }

  return (
    <DeleteConfirmationModal
      message={
        <>
          Are you sure you want to delete the project <strong>{project.name}</strong>?<br/><br/>
          <WarningOutlined /> This action cannot be undone.
        </>
      }
      visible={visible}
      onDelete={handleDelete}
      onCancel={onCancel}
      loading={loading}/>
  )
}