import Link from 'next/link'
import './SignContainer.less'

interface Props {
  children: JSX.Element
}

export const SignContainer = (props: Props) => {
  return (
    <div className="sign-container">
      <div className="sign-tabs-container">
        <div className="flex justify-center mb-4">
          <Link href="/">
            <a>
              <img src="/logo.svg" width={400} alt="ChainJet Logo" />
            </a>
          </Link>
        </div>

        {props.children}
      </div>
    </div>
  )
}
