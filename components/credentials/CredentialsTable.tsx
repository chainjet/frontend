import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Button, Dropdown, Table } from 'antd'
import { useState } from 'react'
import { AccountCredential } from '../../graphql'
import { DeleteCredentialModal } from './DeleteCredentialModal'
import { UpdateCredentialModal } from './UpdateCredentialModal'

interface Props {
  accountCredentials: AccountCredential[]
  onChange: () => any
}

export function CredentialsTable({ accountCredentials, onChange }: Props) {
  const [updatingCredential, setUpdatingCredential] = useState<AccountCredential | null>(null)
  const [deletingCredential, setDeletingCredential] = useState<AccountCredential | null>(null)

  const dataSource = accountCredentials.map((credential) => ({
    key: credential.id,
    name: credential.name,
    integration: credential.integrationAccount.name,
    actions: (
      <>
        <div className="hidden sm:block">
          <Button
            className="mr-4"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setUpdatingCredential(credential)}
          />
          <Button danger type="primary" icon={<DeleteOutlined />} onClick={() => setDeletingCredential(credential)} />
        </div>
        <div className="block sm:hidden">
          <Dropdown.Button
            menu={{
              items: [
                { label: 'Update', key: 'update', onClick: () => setUpdatingCredential(credential) },
                { label: 'Delete', key: 'delete', onClick: () => setDeletingCredential(credential) },
              ],
              onClick: () => {},
            }}
          />
        </div>
      </>
    ),
  }))

  const handleCredentialUpdate = () => {
    setUpdatingCredential(null)
    onChange()
  }

  const handleCredentialDelete = () => {
    setDeletingCredential(null)
    onChange()
  }

  return (
    <>
      <Table
        dataSource={dataSource}
        pagination={false}
        columns={[
          {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: 'Integration',
            key: 'integration',
            dataIndex: 'integration',
          },
          {
            title: 'Actions',
            key: 'actions',
            dataIndex: 'actions',
            align: 'right',
          },
        ]}
      />

      {!!updatingCredential && (
        <UpdateCredentialModal
          visible={true}
          accountCredential={updatingCredential}
          onUpdateAccountCredential={handleCredentialUpdate}
          onCancel={() => setUpdatingCredential(null)}
        />
      )}
      {!!deletingCredential && (
        <DeleteCredentialModal
          visible={true}
          accountCredential={deletingCredential}
          onDeleteAccountCredential={handleCredentialDelete}
          onCancel={() => setDeletingCredential(null)}
        />
      )}
    </>
  )
}

CredentialsTable.fragments = {
  AccountCredential: gql`
    fragment CredentialsTable_AccountCredential on AccountCredential {
      id
      name
      integrationAccount {
        id
        name
      }
    }
  `,
}
