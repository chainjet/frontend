import { DescriptionFieldProps } from '@rjsf/utils'
import ReactMarkdown from 'react-markdown'

export function DescriptionFieldTemplate({ description, id }: DescriptionFieldProps) {
  if (!description) {
    return null
  }
  return (
    <span id={id}>
      <ReactMarkdown
        disallowedElements={['image', 'html']}
        components={{
          a: ({ children: markdownChildren, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {markdownChildren}
            </a>
          ),
        }}
      >
        {description as string}
      </ReactMarkdown>
    </span>
  )
}
