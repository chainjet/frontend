import { gql } from '@apollo/client'
import { Button, Typography } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Integration } from '../../graphql'
import { IntegrationAvatar } from './IntegrationAvatar'

interface Props {
  integration: Integration
}

export function IntegrationBanner({ integration }: Props) {
  const shortName = integration.name.replace(/\([^)]*\)/, '').trim()
  const [banner, setBanner] = useState<string | null>(null)
  const breakpoint = useBreakpoint()

  useEffect(() => {
    try {
      require(`../../public/integrations/${integration.key}/banner.png`)
      setBanner(`/integrations/${integration.key}/banner.png`)
    } catch (err) {}
  }, [integration.key])

  return (
    <div
      className="mx-auto w-fit h-fit sm:w-[750px] sm:h-[300px]"
      style={breakpoint.xs ? {} : { backgroundImage: `url("${banner ?? '/integrations/banner.png'}")` }}
    >
      <div className="grid items-center h-full grid-cols-1 sm:grid-cols-3 mx-auto w-fit sm:w-[600px] gap-4">
        <div className="mx-auto">
          <div className={`block ${banner ? 'sm:hidden' : ''}`}>
            <IntegrationAvatar integration={integration} size={96} />
          </div>
        </div>
        <div className="col-span-2 px-8 sm:px-0">
          <div>
            <Typography.Title level={2}>{integration.name} Integrations</Typography.Title>
            <Typography.Text>
              ChainJet allows you to connect {shortName} with web3 dapps and web2 services, so you can automate your
              work. No code required.
            </Typography.Text>
          </div>
          <div>
            <Link href={`/login?integration=${integration.key}`}>
              <a>
                <Button type="primary" style={{ marginTop: 24 }}>
                  Launch App
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
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
