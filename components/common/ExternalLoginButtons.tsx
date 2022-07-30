import React, { CSSProperties, useState } from 'react'
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import { ImFacebook } from 'react-icons/im'

interface Props {
  message: string
}

const googleButtonStyle: CSSProperties = {
  background: '#4285F4',
  borderColor: '#4285F4'
}

const facebookButtonStyle: CSSProperties = {
  background: '#3b5998',
  borderColor: '#3b5998'
}

const githubButtonStyle: CSSProperties = {
  background: '#333333',
  borderColor: '#333333'
}

export function ExteralLoginButtons (props: Props) {
  const { message } = props
  const [loading, setLoading] = useState('')

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <a href="/api/account-credentials/oauth/google?login=true" onClick={() => setLoading('google')}>
        <Button block type="primary" icon={<GoogleOutlined />} style={googleButtonStyle} loading={loading === 'google'}>
          {message} Google
        </Button>
      </a>
      <a href="/api/account-credentials/oauth/facebook?login=true" onClick={() => setLoading('facebook')}>
        <Button block type="primary" icon={<ImFacebook />} style={facebookButtonStyle} loading={loading === 'facebook'}>
          <span style={{ paddingLeft: '5px' }}>{message} Facebook</span>
        </Button>
      </a>
      <a href="/api/account-credentials/oauth/github?login=true" onClick={() => setLoading('github')}>
        <Button block type="primary" icon={<GithubOutlined />} style={githubButtonStyle} loading={loading === 'github'}>
          {message} GitHub
        </Button>
      </a>
    </Space>
  )
}
