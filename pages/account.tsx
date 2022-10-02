import { Alert, Button } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { UserWorkflows } from '../components/workflows/UserWorkflows'
import { withApollo } from '../src/apollo'
import { useRedirectGuests } from '../src/services/UserHooks'
import { useCreateOneWorkflow } from '../src/services/WorkflowHooks'

function HomePage() {
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
      <PageWrapper title="Workflows">
        <div style={{ marginBottom: 16 }}>
          {error && <Alert message="Error" description={error} type="error" showIcon closable />}
          <Button type="primary" onClick={handleCreateWorkflow} loading={loading}>
            Create Workflow
          </Button>
        </div>
        <UserWorkflows />
      </PageWrapper>
    </>
  )
}

export default withApollo(HomePage)
