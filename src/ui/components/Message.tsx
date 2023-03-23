/** @jsx h */
import { h, JSX, ComponentProps } from 'preact'
import { useState } from 'preact/hooks'

import { Link, Muted } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ReactMarkdown from 'react-markdown'
import { useCopyToClipboard } from 'react-use'
import rehypeHighlight from 'rehype-highlight'

import { ChatMessage } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import Icon from '@/ui/assets/img/icon.png'

import '!highlight.js/styles/default.css'

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
          white-space: pre-wrap;
          word-break: break-word;
          flex: 1;
          margin-top: 8px;
          overflow-x: auto;

          & * {
            user-select: text;
            cursor: auto;
          }

          & > *:first-child {
            margin-top: 0;
          }
          & > *:last-child {
            margin-bottom: 0;
          }

          & > * {
            margin-top: 1.5em;
            margin-bottom: 1.5em;
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

          pre {
            margin: -1.5em 0;
            border-radius: var(--border-radius-6);
            overflow-x: auto;
            width: 100%;

            code {
              hyphens: none;
              word-wrap: normal;
              word-break: normal;
              word-spacing: normal;
              background-color: var(--figma-color-bg-tertiary);
            }
          }
        `}
      >
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
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
