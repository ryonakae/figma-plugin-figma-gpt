/** @jsx h */
import { h, JSX, ComponentProps } from 'preact'

import { Link, Muted } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { createElement, Fragment, ReactNode, useEffect, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import rehypeHighlight from 'rehype-highlight'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import { ChatMessage } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import Icon from '@/ui/assets/img/icon.png'

type MessageProps = ComponentProps<'div'> & ChatMessage

export default function Message({ role, content, ...props }: MessageProps) {
  const [hover, setHover] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()
  const [Node, setNode] = useState<ReactNode>(<div />)

  function onMouseEnter() {
    setHover(true)
  }

  function onMouseLeave() {
    setHover(false)
  }

  function onCopyClick(event: JSX.TargetedEvent<HTMLAnchorElement>) {
    event.preventDefault()
    copyToClipboard(content)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  useEffect(() => {
    const parser = unified()
      // parse string to html
      .use(remarkParse) // markdown -> mdast
      .use(remarkRehype) // mdast -> hast
      .use(rehypeStringify) // hast -> html
      .use(rehypeHighlight) // highlight.js
      // parse html to react node
      .use(rehypeParse, { fragment: true })
      .use(rehypeReact, { Fragment, createElement } as any)

    parser.process(content).then(file => setNode(file.result))
  }, [content])

  return (
    <div
      css={[
        css`
          padding: var(--space-small) var(--space-medium);
          display: flex;
          gap: var(--space-small);
          align-items: flex-start;
          border-bottom: 1px solid var(--figma-color-bg-secondary);
        `,
        role === 'assistant' &&
          css`
            background-color: var(--figma-color-bg-secondary);
          `,
      ]}
      className={props.className as string}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* icon */}
      <div
        css={[
          css`
            width: 32px;
            height: 32px;

            border-radius: var(--border-radius-6);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          `,
          role === 'user' &&
            css`
              background-color: var(--figma-color-icon-brand-tertiary);
            `,
          role === 'assistant' &&
            css`
              background-color: var(--figma-color-icon);
            `,
        ]}
      >
        {role === 'user' && (
          <Muted>
            <span
              css={css`
                font-size: var(--font-size-10);
              `}
            >
              You
            </span>
          </Muted>
        )}
        {role === 'assistant' && (
          <img
            src={Icon}
            css={css`
              width: 18px;
              height: auto;
              mix-blend-mode: exclusion;
            `}
          />
        )}
      </div>

      {/* content */}
      <div
        css={css`
          white-space: pre-wrap;
          word-break: break-word;
          flex: 1;
          user-select: text;
          margin-top: 8px;
        `}
      >
        {Node}
      </div>

      {/* copy button */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
        `}
      >
        <div
          css={css`
            visibility: ${hover ? 'visible' : 'hidden'};
            pointer-events: ${hover ? 'auto' : 'none'};
          `}
        >
          <Link href="#" onClick={onCopyClick}>
            Copy
          </Link>
        </div>
      </div>
    </div>
  )
}
