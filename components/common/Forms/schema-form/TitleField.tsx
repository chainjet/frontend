import React from 'react'
import classNames from 'classnames'
import { withConfigConsumer } from 'antd/lib/config-provider/context'
import { capitalize } from '../../../../src/utils/strings'

// Based on https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/antd/src/fields/TitleField/index.js

const TitleField = ({
  // autofocus,
  // disabled,
  // errorSchema,
  formContext,
  // formData,
  id,
  // idSchema,
  // name,
  // onChange,
  prefixCls,
  // readonly,
  // registry,
  required,
  // schema,
  title,
  // uiSchema,
}: any) => {
  const { colon = true } = formContext

  let labelChildren = title
  if (colon && typeof title === 'string' && title.trim() !== '') {
    labelChildren = title.replace(/[：:]\s*$/, '')
  }

  const labelClassName = classNames({
    [`${prefixCls}-item-required`]: required,
    [`${prefixCls}-item-no-colon`]: !colon,
  })

  const handleLabelClick = () => {
    if (!id) {
      return
    }

    const control: HTMLElement | null = document.querySelector(`[id="${id}"]`)
    control?.focus()
  };

  return title ? (
    <label
      className={labelClassName}
      htmlFor={id}
      onClick={handleLabelClick}
      title={typeof title === 'string' ? capitalize(title) : ''}
    >
      {capitalize(labelChildren)}
    </label>
  ) : null
}

TitleField.defaultProps = {
  formContext: {},
}

export default withConfigConsumer({ prefixCls: 'form' })(TitleField)
