import { Button, Result } from 'antd'
import { useRouter } from 'next/router'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingHeader } from '../components/landing/LandingHeader'

export default function Error404Page() {
  const router = useRouter()

  const handleGoHome = async () => {
    await router.push('/dashboard')
  }

  return (
    <>
      <LandingHeader />
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
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
