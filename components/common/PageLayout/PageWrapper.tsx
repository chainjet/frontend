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
      <div className="m-3 md:m-6" style={{ minHeight: '80vh' }}>
        {children}
      </div>
    </>
  )
}
