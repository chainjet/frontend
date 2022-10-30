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
    case 'object':
      if (value === null) {
        return <span style={{ color: '#0451a5' }}>null</span>
      }
      if (Array.isArray(value)) {
        return (
          <span style={{ color: '#0451a5' }}>
            {value.map((item, index) => (
              <span key={index}>
                <TypeColor value={item} />
                {index < value.length - 1 ? ',' : ''}
              </span>
            ))}
          </span>
        )
      }
      return <span style={{ color: '#0451a5' }}>{JSON.stringify(value)}</span>
    default:
      return <span style={{ color: '#0451a5' }}>{value}</span>
  }
}
