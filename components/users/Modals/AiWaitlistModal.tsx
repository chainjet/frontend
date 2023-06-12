import { MailOutlined } from '@ant-design/icons'
import { Alert, Button, Input, Modal } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { useState } from 'react'
import { AI_WAITLIST } from '../../../src/constants/user-features'
import { useSetAiUseCase, useUpdateOneUser, useViewer } from '../../../src/services/UserHooks'
import { Loading } from '../../common/RequestStates/Loading'

interface Props {
  open: boolean
  onClose: () => void
}

export const AiWaitlistModal = ({ open, onClose }: Props) => {
  const { viewer } = useViewer()
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateUser] = useUpdateOneUser()
  const [setAiUseCase] = useSetAiUseCase()
  const [joined, setJoined] = useState(false)
  const [useSubmitted, setUseSubmitted] = useState(false)
  const [useText, setUseText] = useState('')

  if (!viewer) {
    return <Loading />
  }

  const handleJoinWaitlist = async () => {
    if (viewer.email || !email) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      await updateUser({
        variables: {
          input: {
            id: viewer.id,
            update: {
              email,
              features: {
                ...(viewer.features ?? {}),
                [AI_WAITLIST]: true,
              },
            },
          },
        },
      })
      setJoined(true)
    } catch (e: any) {
      setError(e?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitUse = async () => {
    setLoading(true)

    // join the waitlist if mail already set
    if (!joined) {
      try {
        await updateUser({
          variables: {
            input: {
              id: viewer.id,
              update: {
                features: {
                  ...(viewer.features ?? {}),
                  [AI_WAITLIST]: true,
                },
              },
            },
          },
        })
        setJoined(true)
      } catch (e: any) {
        setError(e?.message)
      }
    }

    try {
      await setAiUseCase({
        variables: {
          use: useText,
        },
      })
      setUseSubmitted(true)
    } catch (e: any) {
      setError(e?.message)
    }
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      title="✨ AI Automation is about to get 100x better ✨"
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      {error && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}
      {!joined && (
        <div className="mb-8 text-center">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/vUx-eJA2Dlw?autoplay=1&mute=1&loop=1&playlist=vUx-eJA2Dlw"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
      {(joined || viewer.email) && (
        <div>
          {joined && (
            <Alert
              style={{ marginBottom: 36 }}
              message="You're in!"
              description="Thanks for joining ChainJet AI waitlist. We will let you know as soon as you can use it!"
              type="success"
              showIcon
            />
          )}
          {!useSubmitted && (
            <div>
              <p>
                <strong>What would you like to automate or build with ChainJet AI?</strong>
              </p>
              <TextArea rows={4} value={useText} onChange={(e) => setUseText(e.target.value)} />
              <p>
                We&#39;d like to know more about how you plan to use ChainJet AI, so we can build the perfect app for
                you!
              </p>
              <div className="mt-6">
                <Button type="primary" onClick={handleSubmitUse} loading={loading}>
                  {joined ? 'Submit' : 'Submit and join waitlist'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {!joined && !viewer.email && (
        <div>
          <div>
            <p>
              <strong>Join the waitlist and be among the first to try ChainJet AI:</strong>
            </p>
          </div>
          <div className="mt-2">
            <Input
              size="large"
              type="email"
              placeholder="Email address"
              prefix={<MailOutlined />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mt-6">
            <Button type="primary" onClick={handleJoinWaitlist} loading={loading}>
              Join waitlist
            </Button>
          </div>
        </div>
      )}
      {joined && useSubmitted && (
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      )}
    </Modal>
  )
}
