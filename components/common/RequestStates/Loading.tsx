import React from 'react'
import { Space, Spin } from 'antd'

export const Loading = () => {
  return (
    <Space size="middle">
      <Spin size="large" />
    </Space>
  )
}
