import { gql } from '@apollo/client'
import { Alert, Button } from 'antd'
import React, { useState } from 'react'
import { User } from '../../../graphql'
import { useGenerateApiKey } from '../../../src/services/UserHooks'

interface Props {
  user: User
}

export function ProfileApiKeyForm(props: Props) {
  const { user } = props
  const [generateApiKey] = useGenerateApiKey()
  const [apiKey, setApiKey] = useState(user?.apiKey)
  const [generatingApiKey, setGeneratingApiKey] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateApiKey = async () => {
    setGeneratingApiKey(true)
    setError(null)
    try {
      const res = await generateApiKey()
      setApiKey(res.data?.generateApiKey?.apiKey)
    } catch (e) {
      setError(e.message)
    } finally {
      setGeneratingApiKey(false)
    }
  }

  return (
    <>
      {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}

      {apiKey ? (
        <>{apiKey}</>
      ) : (
        <Button type="primary" onClick={handleGenerateApiKey} loading={generatingApiKey}>
          Generate API Key
        </Button>
      )}
    </>
  )
}

ProfileApiKeyForm.fragments = {
  User: gql`
    fragment ProfileApiKeyForm_User on User {
      id
      apiKey
    }
  `,
}
