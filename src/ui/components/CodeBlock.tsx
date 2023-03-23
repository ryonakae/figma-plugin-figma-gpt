import { ComponentProps } from 'preact'

import { css } from '@emotion/react'
import { ReactElement, ReactNode } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { useMount } from 'react-use'

type CodeBlockProps = ComponentProps<'div'> & {
  node: any
  className?: string
  children: ReactNode | ReactNode[]
}

export default function CodeBlock({
  node,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || '')

  useMount(() => {
    console.log('CodeBlock mounted', node, className, children, props)
  })

  return (
    <div
      css={css`
        border-radius: var(--border-radius-6);
        overflow: hidden;
      `}
      className={className}
    >
      <div
        css={css`
          padding: 0.5em 1em;
          background-color: var(--figma-color-bg-disabled-secondary);
          display: flex;
          justify-content: space-between;
        `}
      >
        <span>xxx</span>
        <span>Copy code</span>
      </div>
      <div
        css={css`
          background-color: var(--figma-color-bg-tertiary);

          pre {
            margin: 0;
            padding: 1em;
            overflow-x: auto;

            code,
            code.hljs {
              display: block;
              padding: 0;
              hyphens: none;
              word-wrap: normal;
              word-break: normal;
              word-spacing: normal;
              background-color: transparent;
            }
          }
        `}
      >
        {match ? (
          <SyntaxHighlighter language={match[1]}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <pre className={className}>{children}</pre>
        )}
      </div>
    </div>
  )
}
