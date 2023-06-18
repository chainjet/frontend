import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Avatar, Button, Input } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useEnsAvatar } from 'wagmi'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../components/common/RequestStates/Loading'
import { CreateWorkflowModal } from '../../components/conversations/CreateWorkflowModal'
import { IntegrationAvatar } from '../../components/integrations/IntegrationAvatar'
import { OperationsUsed } from '../../components/users/OperationsUsed'
import { SendPromptPayload } from '../../graphql'
import { withApollo } from '../../src/apollo'
import { useSendPrompt } from '../../src/services/AiHooks'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string | JSX.Element
}

function ConversationsPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendPrompt] = useSendPrompt()
  const [lastPromptData, setLastPromptData] = useState<SendPromptPayload | null>(null)
  const [createWorkflowModalOpen, setCreateWorkflowModalOpen] = useState(false)
  const { data: userAvatar } = useEnsAvatar()

  const handleSendMessage = async () => {
    if (!newMessage) {
      return
    }
    setLoading(true)
    setError(null)
    const newMessages: Message[] = [
      { role: 'user', content: newMessage },
      { role: 'assistant', content: <Loading /> },
    ]
    setMessages([...messages, ...newMessages])
    setNewMessage('')
    try {
      const res = await sendPrompt({ variables: { prompt: newMessage } })
      const data = res.data?.sendPrompt as SendPromptPayload | null
      if (!data) {
        throw new Error('Unexpected error, please try again')
      }
      setLastPromptData(data)
      newMessages[1].id = data.id
      newMessages[1].content = (
        <div className="p-4">
          <p>
            <div className="mb-2 text-2xl font-bold">Trigger</div>
            <div className="flex flex-row items-center gap-4">
              <div>
                <IntegrationAvatar
                  integration={{ name: data.trigger.integrationName, logo: data.trigger.integrationLogo }}
                />
              </div>
              <div className="w-full">
                <div className="text-lg font-bold">{data.trigger.name}</div>
                <div className="mb-2 text-sm leading-6 text-gray-600">{data.trigger.description}</div>
                <div>
                  {Object.entries(data.trigger.inputs).map(([key, value]) => {
                    return (
                      <p key={key} className="mb-1">
                        {' '}
                        <strong>{key}</strong>: {value}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          </p>
          <p>
            <div className="mb-2 text-2xl font-bold">Actions</div>
            {data.actions.map((action: any, index: number) => (
              <div className="flex flex-row items-center gap-4" key={index}>
                <div>
                  <IntegrationAvatar integration={{ name: action.integrationName, logo: action.integrationLogo }} />
                </div>
                <div className="w-full">
                  <div className="text-lg font-bold">{action.name}</div>
                  <div className="mb-2 text-sm leading-6 text-gray-600">{action.description}</div>
                  <div>
                    {Object.entries(action.inputs).map(([key, value]) => {
                      return (
                        <p key={key} className="mb-1">
                          {' '}
                          <strong>{key}</strong>: {value}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </p>
        </div>
      )
      setMessages([...messages, ...newMessages])
    } catch (e) {
      setError((e as any).message)
      newMessages.pop() // remove loading message
      setMessages([...messages, ...newMessages])
    } finally {
      setLoading(false)
    }
  }

  const onWorkflowCreated = async (id: string) => {
    setCreateWorkflowModalOpen(false)
    setMessages([
      ...messages,
      {
        role: 'assistant',
        content: (
          <>
            Workflow created succesfully. <Link href={`/workflows/${id}`}>View it here</Link>
          </>
        ),
      },
    ])
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <Head>
        <title>ChainJet AI</title>
      </Head>
      <PageWrapper title="ChainJet AI (Beta)" extra={<OperationsUsed />}>
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert message="Error" description={error} type="error" showIcon closable />
          </div>
        )}
        <div className="flex h-screen antialiased text-gray-800">
          <div className="flex flex-row w-full overflow-x-hidden h-5/6">
            {/* <div className="flex flex-col flex-shrink-0 w-64 py-8 pl-6 pr-2 bg-white"></div> */}
            <div className="flex flex-col flex-auto h-full p-6">
              <div className="flex flex-col flex-auto flex-shrink-0 h-full p-4 bg-gray-100 rounded-2xl">
                <div className="flex flex-col h-full mb-4 overflow-x-auto">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-12 gap-y-2">
                      {messages.map((message, index) =>
                        message.role === 'assistant' ? (
                          <div className="col-start-1 col-end-8 p-3 rounded-lg" key={index}>
                            <div className="flex flex-row items-center">
                              <Avatar src="/apple-touch-icon.png" />
                              <div className="relative px-4 py-2 ml-3 text-sm bg-white shadow rounded-xl">
                                <div>{message.content}</div>
                                {message.id && (
                                  <div className="mb-4 text-center">
                                    <Button
                                      type="primary"
                                      onClick={() => setCreateWorkflowModalOpen(true)}
                                      disabled={loading}
                                    >
                                      Create Workflow
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="col-start-6 col-end-13 p-3 rounded-lg" key={index}>
                            <div className="flex flex-row-reverse items-center justify-start">
                              {userAvatar ? <Avatar src={userAvatar} /> : <Avatar icon={<UserOutlined />} />}
                              <div className="relative px-4 py-2 mr-3 text-sm bg-indigo-100 shadow rounded-xl">
                                <div>{message.content}</div>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center w-full h-16 px-4 bg-white rounded-xl">
                  <div className="flex-grow ml-4">
                    <div className="relative w-full">
                      <Input
                        type="text"
                        className="flex w-full h-10 pl-4 border rounded-xl focus:outline-none focus:border-indigo-300"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setCreateWorkflowModalOpen(true)}
                      loading={loading}
                    >
                      <span>Send</span>
                      <SendOutlined />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
      {createWorkflowModalOpen && lastPromptData && (
        <CreateWorkflowModal
          promptData={lastPromptData}
          visible
          onCreateWorkflow={onWorkflowCreated}
          onClose={() => setCreateWorkflowModalOpen(false)}
        />
      )}
    </>
  )
}

export default withApollo(ConversationsPage)
