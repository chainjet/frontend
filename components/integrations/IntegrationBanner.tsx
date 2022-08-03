import { gql } from '@apollo/client'
import { Button, Card, Col, Row, Typography } from 'antd'
import Link from 'next/link'
import React from 'react'
import { Integration } from '../../graphql'
import { IntegrationAvatar } from './IntegrationAvatar'

interface Props {
  integration: Integration
}

export function IntegrationBanner(props: Props) {
  const { integration } = props
  const shortName = integration.name.replace(/\([^)]*\)/, '').trim()

  return (
    <Card style={{ padding: '48px 0' }}>
      <Row gutter={160} align="middle">
        <Col xs={24} md={2} offset={4} style={{ marginBottom: 32 }}>
          <IntegrationAvatar integration={integration} size={96} />
        </Col>
        <Col xs={24} md={14}>
          <div>
            <Typography.Title level={2}>{integration.name}</Typography.Title>
            <Typography.Text>
              ChainJet allows you to automate repetitive tasks in {shortName}. Connect {shortName} with over 300
              integrations and unlock its potential. No coding skills required.
            </Typography.Text>
          </div>
          <div>
            <Link href={`/register?integration=${integration.key}`}>
              <a>
                <Button type="primary" style={{ marginTop: 24 }}>
                  Start for free
                </Button>
              </a>
            </Link>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

IntegrationBanner.fragments = {
  Integration: gql`
    fragment IntegrationBanner_Integration on Integration {
      id
      key
      name
      logo
    }
  `,
}
