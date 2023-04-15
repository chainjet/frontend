import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { OperationsUsed } from '../components/users/OperationsUsed'
import { withApollo } from '../src/apollo'

function BulkActionsPage() {
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Head>
        <title>ChainJet Bulk Actions</title>
      </Head>
      <PageWrapper title="Bulk Actions" extra={<OperationsUsed />}>
        <div className="container px-0 mx-auto lg:px-24">
          <Card className="w-full flex justify-center">
            <div className="w-full md:w-fit gap-4 my-8">
              <div className="text-center text-2xl font-bold mb-8">Create your first Bulk Action</div>
              <div className="text-center text-lg mb-12">
                Execute actions for all historical data, ideal for large-scale processes and efficient data management.
              </div>
              <div className="text-center">
                <Link href="/create/bulkaction">
                  <Button type="primary" icon={<PlusOutlined />} loading={loading} onClick={() => setLoading(true)}>
                    Create a Bulk Action
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(BulkActionsPage)
