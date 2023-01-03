import { TitleFieldProps } from '@rjsf/utils'
import { withConfigConsumer } from 'antd/lib/config-provider/context'
import classNames from 'classnames'
import { capitalize } from '../../../../src/utils/strings'

// Add in the `prefixCls` element needed by the `withConfigConsumer` HOC
export type AntdTitleFieldProps = TitleFieldProps & {
  prefixCls: string
  formContext: object
}

const TitleField = ({ id, prefixCls, required, registry, formContext: formContext1, title }: any) => {
  const { formContext } = registry
  const { colon = true } = { ...formContext1, ...formContext }

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
  }

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

export default withConfigConsumer<any>({ prefixCls: 'form' })(TitleField)
