interface Props {
  value: any
}

export function TypeColor({ value }: Props) {
  switch (typeof value) {
    case 'string':
      return <span style={{ color: '#a31515' }}>{value}</span>
    case 'number':
      return <span style={{ color: '#098658' }}>{value}</span>
    case 'boolean':
      return <span style={{ color: '#0451a5' }}>{value.toString()}</span>
    default:
      return <span style={{ color: '#0451a5' }}>{value}</span>
  }
}
