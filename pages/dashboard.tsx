import { NotificationOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Alert, Card } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { RecommendedTemplates } from '../components/templates/RecommendedTemplates'
import { withApollo } from '../src/apollo'
import { useRedirectGuests } from '../src/services/UserHooks'
import { useCreateOneWorkflow } from '../src/services/WorkflowHooks'

function DashboardPage() {
  const { signer } = useRedirectGuests()
  const [loading, serLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createWorkflow] = useCreateOneWorkflow()
  const router = useRouter()

  if (!signer) {
    return <></>
  }

  const handleCreateWorkflow = async () => {
    serLoading(true)
    try {
      const workflowRes = await createWorkflow({
        variables: {
          input: {
            workflow: {
              name: 'Untitled Workflow',
            },
          },
        },
      })
      const workflowId = workflowRes.data?.createOneWorkflow?.id
      if (workflowId) {
        await router.push(`/workflows/${workflowId}`)
      } else {
        setError('Unexpected error, please try again')
        serLoading(false)
      }
    } catch (e: any) {
      setError(e.message)
      serLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>ChainJet Dashboard</title>
      </Head>
      <PageWrapper title="Dashboard">
        <div style={{ marginBottom: 16 }}>
          {error && <Alert message="Error" description={error} type="error" showIcon closable />}
        </div>
        <div className="container px-0 mx-auto lg:px-24">
          <div className="mb-8">
            <div className="mb-4">
              <span className="text-xl font-bold">Get Started</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="w-full"
                hoverable
                onClick={handleCreateWorkflow}
                style={{ backgroundColor: '#d6b4ff', height: 78 }}
              >
                <div className="flex justify-center gap-4">
                  <div className="mt-0.5">
                    <PlusCircleOutlined style={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Create Workflow</p>
                  </div>
                </div>
              </Card>
              <Link href="/create/notification">
                <Card className="w-full" hoverable style={{ height: 78 }}>
                  <div className="flex justify-center gap-4">
                    <div className="mt-0.5">
                      <NotificationOutlined style={{ fontSize: 24 }} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Create Notification</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-xl font-bold">Recommended Templates</span>
          </div>
          <RecommendedTemplates />
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(DashboardPage)
