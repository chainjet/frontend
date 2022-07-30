import React from 'react'

// Attempt to use Formily instead of "react-jsonschema-form" (https://github.com/alibaba/formily)
// Pros:
//   - Antd support is better
//   - Typescript support is much better
// Cons:
//   - It doesn't support additionalProperties
//   - Support of arrays is very strange

// import { SchemaForm } from '@formily/antd'
// import { setup } from '@formily/antd-components'
// import 'antd/dist/antd.css'
//
// type OperationInputs = { [key: string]: any }
//
// interface Props {
//   schema: any
//   initialInputs: OperationInputs
//   onChange?: () => any
//   onSubmit: (inputs: OperationInputs) => any
//   onError?: () => any
// }
//
// export const Formily = (props: Props) => {
//   const { schema, initialInputs, onChange, onSubmit, onError } = props
//   setup()
//   return (
//     <SchemaForm schema={schema}/>
//   )
// }
