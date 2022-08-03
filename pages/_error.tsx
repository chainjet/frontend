import React from 'react'
import { Button, Result } from 'antd'
import { NextPageContext } from 'next'
import { LandingHeader } from '../components/landing/LandingHeader'
import { LandingFooter } from '../components/landing/LandingFooter'
import { ResultStatusType } from 'antd/lib/result'
import { useRouter } from 'next/router'
import { ApolloError } from '@apollo/client'

interface Props {
  statusCode?: ResultStatusType
  error?: ApolloError
}

export function ErrorPage({ statusCode, error }: Props) {
  const router = useRouter()

  const handleGoHome = async () => {
    await router.push('/')
  }

  return (
    <>
      <LandingHeader />
      <Result
        status={statusCode ?? 500}
        title="Error occurred"
        subTitle={error?.message ?? `Sorry, an unexpected error occurred. Please try again.`}
        extra={
          <Button type="primary" onClick={handleGoHome}>
            Back Home
          </Button>
        }
      />
      <LandingFooter />
    </>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
