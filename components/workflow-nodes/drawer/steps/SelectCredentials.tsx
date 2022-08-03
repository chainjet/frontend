import React, { useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { Loading } from '../../../common/RequestStates/Loading'
import { RequestError } from '../../../common/RequestStates/RequestError'
import { Button, Select, Typography } from 'antd'
import { SchemaForm } from '../../../common/Forms/schema-form/SchemaForm'
import { IntegrationAccount } from '../../../../graphql'
import {
  useCreateOneAccountCredential,
  useGetAccountCredentials,
} from '../../../../src/services/AccountCredentialHooks'

interface Props {
  integrationAccount: IntegrationAccount
  onCredentialsSelected: (id: string) => any
}

const credentialsFragment = gql`
  fragment SelectCredentialsStepFragment on AccountCredential {
    id
    name
  }
`

export const SelectCredentials = (props: Props) => {
  const { integrationAccount: integrationAccount, onCredentialsSelected } = props
  const queryVars = {
    filter: {
      integrationAccount: {
        eq: integrationAccount.id,
      },
    },
  }
  const { data, loading, error, refetch } = useGetAccountCredentials(credentialsFragment, {
    variables: queryVars,
    fetchPolicy: 'network-only',
  })
  const [selectedCredentialID, setSelectedCredentialID] = useState<string | undefined>(
    data?.accountCredentials?.edges?.[0]?.node?.id,
  )
  const [createCredential] = useCreateOneAccountCredential()
  const [createCredentialLoading, setCreateCredentialLoading] = useState(false)
  const accountNameKey = '__name'

  useEffect(() => {
    setSelectedCredentialID(data?.accountCredentials?.edges?.[0]?.node?.id)
  }, [data])

  // refetch credentials on page re-focus
  useEffect(() => {
    const focusRefetch = () => void refetch(queryVars)
    window.addEventListener('focus', focusRefetch)
    return function cleanup() {
      window.removeEventListener('focus', focusRefetch)
    }
  }, [])

  const handleCredentialSelectChange = (value: string) => {
    setSelectedCredentialID(value)
  }

  const handleNewCredentialSubmit = async (inputs: { [key: string]: any }) => {
    if (!integrationAccount.fieldsSchema) {
      return // TODO
    }
    setCreateCredentialLoading(true)
    const credentialInputs = { ...inputs }
    const exposedInputs: Record<string, unknown> = {}
    const name: string = credentialInputs[accountNameKey]
    delete credentialInputs[accountNameKey]
    for (const exposedField of integrationAccount.fieldsSchema.exposed || []) {
      if (credentialInputs[exposedField]) {
        exposedInputs[exposedField] = credentialInputs[exposedField]
        delete credentialInputs[exposedField]
      }
    }
    const res = await createCredential({
      variables: {
        input: {
          accountCredential: {
            name,
            integrationAccount: integrationAccount.id,
            credentials: credentialInputs,
            fields: exposedInputs,
          },
        },
      },
    })
    if (res.data?.createOneAccountCredential?.id) {
      await onCredentialsSelected(res.data.createOneAccountCredential.id)
      setCreateCredentialLoading(false)
    } else {
      // TODO show error
    }
  }

  const handleContinueClick = () => {
    if (selectedCredentialID) {
      onCredentialsSelected(selectedCredentialID)
    }
  }

  const handleConnectOauthAccountClick = (key: string) => {
    const popup = window.open(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/account-credentials/oauth/${key}`)
    if (popup) {
      popup.addEventListener('beforeunload', () => {
        void onOauthAccountConnected()
      })
    }
  }

  const onOauthAccountConnected = async () => {
    await refetch(queryVars)
  }

  if (loading) {
    return <Loading />
  }
  if (error) {
    return <RequestError error={error} />
  }

  const credentials = data?.accountCredentials?.edges.map((edge) => edge.node) ?? []

  const renderAccountSelector = () => (
    <div style={{ marginBottom: '16px' }}>
      <Select
        defaultValue={credentials.length ? credentials[0].id : ''}
        size="large"
        onChange={handleCredentialSelectChange}
      >
        {credentials.map((credential, i) => (
          <Select.Option value={credential.id} key={i}>
            {credential.name}
          </Select.Option>
        ))}
        <Select.Option value="">Add a new account</Select.Option>
      </Select>
    </div>
  )

  const renderNewAccount = () => {
    switch (integrationAccount.authType) {
      case 'apiKey':
      case 'http':
        if (!integrationAccount.fieldsSchema) {
          return <></> // TODO
        }

        // Add credentials name field
        const schema = {
          ...integrationAccount.fieldsSchema,
          required: [accountNameKey, ...(integrationAccount.fieldsSchema.required || [])],
          properties: {
            [accountNameKey]: {
              title: 'Name',
              type: 'string',
              default: `My ${integrationAccount.name} account`,
            },
            ...(integrationAccount.fieldsSchema.properties || {}),
          },
        }
        return (
          <>
            <Typography.Title level={4}>Add a new {integrationAccount.name} account</Typography.Title>
            <SchemaForm
              schema={schema}
              initialInputs={{}}
              loading={createCredentialLoading}
              onSubmit={handleNewCredentialSubmit}
            />
          </>
        )
      case 'oauth1':
      case 'oauth2':
        return (
          <Button type="primary" onClick={() => handleConnectOauthAccountClick(integrationAccount.key)}>
            Connect {integrationAccount.name} account
          </Button>
        )
    }
  }

  return (
    <>
      {credentials.length ? renderAccountSelector() : ''}

      {selectedCredentialID ? (
        <Button type="primary" onClick={handleContinueClick}>
          Continue
        </Button>
      ) : (
        renderNewAccount()
      )}
    </>
  )
}

SelectCredentials.fragments = {
  IntegrationAccount: gql`
    fragment SelectCredentials_IntegrationAccount on IntegrationAccount {
      id
      key
      name
      fieldsSchema
      authType
    }
  `,
}
