import { Input, Button, Form, Alert } from 'antd'
import React, { useEffect, useState } from 'react'
import { Project } from '../../graphql'
import { useViewer } from '../../src/services/UserHooks'
import { slugify } from '../../src/utils/strings'

interface Props {
  project?: Project
  showSubmit: boolean
  onSubmit: (project: Partial<Project>) => void
  onChange?: (key: keyof Project, value: any) => void
  loading?: boolean
  error: string | null
}

export const ProjectForm = (props: Props) => {
  const { project, showSubmit, onSubmit, onChange, loading, error } = props
  const { viewer } = useViewer()
  const [name, setName] = useState(project?.name ?? '')
  const [form] = Form.useForm()

  useEffect(() => {
    setName(project?.name ?? '')
  }, [project])

  const handleNameChange = (value: string) => {
    setName(value)
    onChange?.('name', value)
  }

  return (
    <>
      {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}
      <Form form={form} name="project-form" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Project Name"
          initialValue={name}
          rules={[{ required: true }]}
          help={name && `https://chainjet.io/${viewer?.username}/${slugify(name)}`}
        >
          <Input allowClear onChange={(e) => handleNameChange(e.target.value)} />
        </Form.Item>
        {showSubmit && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        )}
      </Form>
    </>
  )
}
