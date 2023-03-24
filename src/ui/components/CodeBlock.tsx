/** @jsx h */
import { h } from 'preact'

import { css } from '@emotion/react'
import { ReactNode } from 'react'
import { Element } from 'react-markdown/lib/rehype-filter'

// import '!highlight.js/styles/github.css'

type CodeBlockProps = {
  node: Element
  className?: string
  children: ReactNode | ReactNode[]
}

export default function CodeBlock({
  node,
  className,
  children,
}: CodeBlockProps) {
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
          background-color: var(--figma-color-bg-disabled);
          display: flex;
          justify-content: space-between;
        `}
      >
        <span>Code</span>
        <span>Copy code</span>
      </div>
      <div
        css={css`
          background-color: var(--figma-color-bg-tertiary);
        `}
      >
        <pre
          css={css`
            margin: 0;
            padding: 1em;
            overflow-x: auto;

            code,
            code.hljs {
              font-family: 'Menlo, Monaco, "Courier New", monospace';
              display: block;
              padding: 0;
              hyphens: none;
              word-wrap: normal;
              word-break: normal;
              word-spacing: normal;
              background-color: transparent;
            }
          `}
        >
          {children}
        </pre>
      </div>
    </div>
  )
}
