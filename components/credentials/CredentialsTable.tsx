import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Button, Table } from 'antd'
import React, { useState } from 'react'
import { AccountCredential } from '../../graphql'
import { DeleteCredentialModal } from './DeleteCredentialModal'

interface Props {
  accountCredentials: AccountCredential[]
}

export function CredentialsTable(props: Props) {
  const { accountCredentials } = props
  const [deletingCredential, setDeletingCredential] = useState<AccountCredential | null>(null)

  const dataSource = accountCredentials.map(credential => ({
    key: credential.id,
    name: credential.name,
    integration: credential.integrationAccount.name,
    actions: (
      <>
        {/* TODO implement edit credentials */}
        {/* <Button type="primary"
                icon={<EditOutlined />}
                style={{ marginRight: 16 }}/> */}
        <Button danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => setDeletingCredential(credential)}/>
      </>
    )
  }))

  return (
    <>
      <Table
        dataSource={dataSource}
        pagination={false}
        columns={[
          {
            title: 'Name',
            key: 'name',
            dataIndex: 'name'
          },
          {
            title: 'Integration',
            key: 'integration',
            dataIndex: 'integration'
          },
          {
            title: 'Delete credential', // TODO rename to actions after editing is implemented
            key: 'actions',
            dataIndex: 'actions',
            align: 'right'
          }
        ]}/>
        
        {
          !!deletingCredential && (
            <DeleteCredentialModal visible={true}
                                   accountCredential={deletingCredential}
                                   onDeleteAccountCredential={() => setDeletingCredential(null)}
                                   onCancel={() => setDeletingCredential(null)}/>
          )
        }
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
  `
}
