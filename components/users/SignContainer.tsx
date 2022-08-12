import './SignContainer.less'

interface Props {
  children: JSX.Element
}

export const SignContainer = (props: Props) => {
  return (
    <div className="sign-container">
      <div className="sign-tabs-container">
        <div style={{ marginLeft: 55 }}>
          {/* <Link href="/">
            <a>
              <img src="/logo.svg" style={{ width: 200 }} />
            </a>
          </Link> */}
        </div>

        {props.children}
      </div>
    </div>
  )
}
