/** @jsx h */
import { JSX, ComponentProps } from 'preact'
import { useState } from 'preact/hooks'

import { Link, Muted } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ReactMarkdown from 'react-markdown'
import { useCopyToClipboard } from 'react-use'
import rehypeHighlight, {
  Options as rehypeHighlightOptions,
} from 'rehype-highlight'

import { ChatMessage } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import Icon from '@/ui/assets/img/icon.png'
import CodeBlockProps from '@/ui/components/CodeBlock'

type MessageProps = ComponentProps<'div'> & ChatMessage

export default function Message({ role, content, ...props }: MessageProps) {
  const [hover, setHover] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()

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
          margin-top: 8px;
          white-space: pre-wrap;
          word-break: break-word;
          flex: 1;
          overflow-x: auto;
          display: flex;
          flex-direction: column;
          row-gap: 1em;

          & * {
            user-select: text;
            cursor: auto;
          }

          & > * {
            margin-top: 0;
            margin-bottom: 0;
          }

          p {
            code {
              color: var(--figma-color-text-secondary);

              &::before,
              &::after {
                content: '\`';
              }
            }
          }
        `}
      >
        <ReactMarkdown
          rehypePlugins={[
            [
              rehypeHighlight,
              {
                detect: true,
                ignoreMissing: true,
              } as rehypeHighlightOptions,
            ],
          ]}
          components={{
            pre({ node, className, children, ...props }) {
              return (
                <CodeBlockProps node={node} className={className}>
                  {children}
                </CodeBlockProps>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
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
