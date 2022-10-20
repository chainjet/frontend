import { gql } from '@apollo/client'
import { Button, Select, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { IntegrationAccount } from '../../../../../graphql'
import {
  useCreateOneAccountCredential,
  useGetAccountCredentials,
} from '../../../../../src/services/AccountCredentialHooks'
import { SchemaForm } from '../../../../common/Forms/schema-form/SchemaForm'
import { Loading } from '../../../../common/RequestStates/Loading'
import { RequestError } from '../../../../common/RequestStates/RequestError'
import { SelectCustomCredentials } from './SelectCustomCredentials'

interface Props {
  integrationAccount: IntegrationAccount
  onCredentialsSelected: (id: string) => any
  hideNameInput?: boolean
  hideSubmitButton?: boolean
  autoConnectIfNoAccount?: boolean // open oauth page automatically if there are no accounts connected
}

const credentialsFragment = gql`
  fragment SelectCredentialsStepFragment on AccountCredential {
    id
    name
    integrationAccount {
      id
    }
  }
`

export const SelectCredentials = ({
  integrationAccount,
  onCredentialsSelected,
  hideNameInput,
  hideSubmitButton,
  autoConnectIfNoAccount,
}: Props) => {
  const queryVars = useMemo(
    () => ({
      filter: {
        integrationAccount: {
          eq: integrationAccount.id,
        },
      },
    }),
    [integrationAccount.id],
  )
  const { data, loading, error, refetch } = useGetAccountCredentials(credentialsFragment, {
    variables: queryVars,
    fetchPolicy: 'network-only',
  })
  const credentials = useMemo(() => data?.accountCredentials?.edges.map((edge) => edge.node) ?? [], [data])

  const [selectedCredentialID, setSelectedCredentialID] = useState<string | undefined>(
    data?.accountCredentials?.edges?.[0]?.node?.id,
  )
  const [createCredential] = useCreateOneAccountCredential()
  const [createCredentialLoading, setCreateCredentialLoading] = useState(false)
  const accountNameKey = '__name'

  useEffect(() => {
    const credential = data?.accountCredentials?.edges?.[0]?.node
    if (credential) {
      setSelectedCredentialID(credential.id)
      if (hideSubmitButton && credential.integrationAccount?.id === integrationAccount?.id) {
        onCredentialsSelected(credential.id)
      }
    }
  }, [data, hideSubmitButton, integrationAccount, onCredentialsSelected])

  // refetch credentials on page re-focus
  useEffect(() => {
    if (!refetch) {
      return
    }
    const focusRefetch = () => refetch(queryVars)
    window.addEventListener('focus', focusRefetch)
    return function cleanup() {
      window.removeEventListener('focus', focusRefetch)
    }
  }, [queryVars, refetch])

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
            credentialInputs,
            fields: exposedInputs,
          },
        },
      },
    })
    if (res.data?.createOneAccountCredential?.id) {
      await onCredentialsSelected(res.data.createOneAccountCredential.id)
      refetch?.(queryVars)
    } else {
      // TODO show error
    }
    setCreateCredentialLoading(false)
  }

  const handleContinueClick = () => {
    if (selectedCredentialID) {
      onCredentialsSelected(selectedCredentialID)
    }
  }

  const onOauthAccountConnected = useCallback(async () => {
    await refetch(queryVars)
  }, [queryVars, refetch])

  const handleConnectOauthAccountClick = useCallback(
    (key: string) => {
      const popup = window.open(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/account-credentials/oauth/${key}`)
      if (popup) {
        popup.addEventListener('beforeunload', () => {
          void onOauthAccountConnected()
        })
      }
    },
    [onOauthAccountConnected],
  )

  // if autoConnectIfNoAccount is true, open oauth page automatically if there are no accounts connected
  useEffect(() => {
    if (
      autoConnectIfNoAccount &&
      !loading &&
      !credentials.length &&
      ['oauth1', 'oauth2'].includes(integrationAccount.authType)
    ) {
      handleConnectOauthAccountClick(integrationAccount.key)
    }
  }, [
    autoConnectIfNoAccount,
    credentials,
    handleConnectOauthAccountClick,
    integrationAccount.authType,
    integrationAccount.key,
    loading,
  ])

  const onCustomCredentialsSelected = useCallback(
    async (id: string) => {
      await onCredentialsSelected(id)
      refetch?.(queryVars)
    },
    [onCredentialsSelected, queryVars, refetch],
  )

  if (loading) {
    return <Loading />
  }
  if (error) {
    return <RequestError error={error} />
  }

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
              ...(hideNameInput ? { 'x-ui:widget': 'hidden' } : {}),
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
              submitButtonText="Connect"
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
      case 'custom':
        return (
          <SelectCustomCredentials
            integrationAccount={integrationAccount}
            onCredentialsSelected={onCustomCredentialsSelected}
          />
        )
    }
  }

  return (
    <>
      {credentials.length ? renderAccountSelector() : ''}

      {selectedCredentialID
        ? !hideSubmitButton && (
            <Button type="primary" onClick={handleContinueClick}>
              Continue
            </Button>
          )
        : renderNewAccount()}
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
