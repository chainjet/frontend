import { PageHeader } from 'antd'
import { PageHeaderProps } from 'antd/lib/page-header'
import React from 'react'

interface Props extends PageHeaderProps {
  children: React.ReactNode
  header?: React.ReactNode
}

export const PageWrapper = (props: Props) => {
  const { children, header } = props
  const pageHeaderProps = {
    ghost: false,
    ...props,
    children: undefined,
  }

  return (
    <>
      <PageHeader {...pageHeaderProps}>{header}</PageHeader>
      <div style={{ margin: '24px 24px 0', minHeight: '80vh' }}>{children}</div>
    </>
  )
}
