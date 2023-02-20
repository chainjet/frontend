import { Divider } from 'antd'
import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="flex w-full p-8" style={{ backgroundColor: '#5503bb' }}>
      <div className="container mx-auto max-w-7xl">
        <Link href="/">
          <img src="/img/logo.png" loading="lazy" width={216} alt="ChainJet Logo" />
        </Link>
        <div className="grid w-full grid-cols-1 gap-4 mt-8 text-lg text-white md:grid-cols-4">
          <div className="w-full">
            <div className="mb-4 font-black">Product</div>
            <div className="mb-2">
              <Link href="/">
                <a className="text-white">Home</a>
              </Link>
            </div>
            <div className="mb-2">
              <Link href="/integrations">
                <a className="text-white">Integrations</a>
              </Link>
            </div>
            <div className="mb-2">
              <a href="https://docs.chainjet.io" target="blank" rel="noopener noreferrer" className="text-white">
                Documentation
              </a>
            </div>
            <div className="mb-2">
              <a
                href="https://drive.google.com/drive/folders/1MxjmZb2XylcxZis60Pz5l1NCV-vssrs3?usp=share_link"
                target="blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                Logo Assets
              </a>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-4 font-black">Legal</div>
            <div className="mb-2">
              <Link href="/legal/terms">
                <a className="text-white">Terms</a>
              </Link>
            </div>
            <div className="mb-2">
              <Link href="/legal/privacy">
                <a className="text-white">Privacy</a>
              </Link>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-4 font-black">Get in touch</div>
            <div className="mb-2">
              <a href="mailto:support@chainjet.io" className="text-white">
                support@chainjet.io
              </a>
            </div>
            <div className="mb-2">
              <a href="https://discord.gg/QFnSwqj9YH" target="blank" rel="noopener noreferrer" className="text-white">
                Discord
              </a>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-4 font-black">
              <img src="/img/magnifying-glass.png" alt="Open Source" className="mr-2" />
              Open Source
            </div>
            <div>
              <iframe
                src="https://ghbtns.com/github-btn.html?user=chainjet&amp;repo=platform&amp;type=star&amp;count=true"
                frameBorder="0"
                scrolling="0"
                width="110"
                height="20"
                title="Star Ghost on GitHub"
              />
            </div>
          </div>
        </div>
        <Divider className="bg-white" />
        <div>
          <div className="grid grid-cols-1 gap-4 text-lg text-white md:grid-cols-2">
            <div>© All rights reserved.</div>
            <div className="flex justify-start gap-4 text-left md:text-right md:justify-end">
              <div>
                <a
                  href="https://twitter.com/chainjetio"
                  target="_blank"
                  className="link-block-2 w-inline-block"
                  rel="noreferrer"
                >
                  <img src="/img/twitter.png" loading="lazy" width="30" height="Auto" alt="Twitter logo" />
                </a>
              </div>
              <div>
                <a
                  href="https://discord.gg/QFnSwqj9YH"
                  target="_blank"
                  className="link-block-2 w-inline-block"
                  rel="noreferrer"
                >
                  <img src="/img/discord.png" loading="lazy" width="30" height="Auto" alt="Discord logo" />
                </a>
              </div>
              <div>
                <a
                  href="https://reddit.com/r/chainjet"
                  target="_blank"
                  className="link-block-2 w-inline-block"
                  rel="noreferrer"
                >
                  <img src="/img/reddit.png" loading="lazy" width="30" height="Auto" alt="Reddit logo" />
                </a>
              </div>
              <div>
                <a
                  href="https://www.youtube.com/channel/UCmOwLVmAZbtFV54RA9SqHsw"
                  target="_blank"
                  className="link-block-2 w-inline-block"
                  rel="noreferrer"
                >
                  <img src="/img/youtube.png" loading="lazy" width="30" height="Auto" alt="YouTube logo" />
                </a>
              </div>
              <div>
                <a
                  href="https://github.com/chainjet/platform"
                  target="_blank"
                  className="link-block-2 w-inline-block"
                  rel="noreferrer"
                >
                  <img src="/img/github.png" loading="lazy" width="30" height="Auto" alt="GitHub logo" />
                </a>
              </div>
              <div>
                <a
                  href="https://lenster.xyz/u/chainjet"
                  target="_blank"
                  className="link-block-2 w-inline-block"
                  rel="noreferrer"
                >
                  <img src="/img/lenster.png" loading="lazy" width="30" height="Auto" alt="Lenster logo" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
