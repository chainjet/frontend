import { createContext, useState } from 'react'

export const SignerContext = createContext<{ signer?: string; setSigner: any }>({ setSigner: null })

interface Props {
  signer?: string
  children: JSX.Element[] | JSX.Element
}

const SignerContextProvider = (props: Props) => {
  const [signer, setSigner] = useState<string | undefined>(props.signer)
  return <SignerContext.Provider value={{ signer, setSigner }}>{props.children}</SignerContext.Provider>
}

export default SignerContextProvider
