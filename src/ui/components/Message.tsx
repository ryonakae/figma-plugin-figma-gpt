/** @jsx h */
import { JSX, ComponentProps } from 'preact'
import { useState } from 'preact/hooks'

import { IconButton, Muted } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ReactMarkdown from 'react-markdown'
import { useCopyToClipboard } from 'react-use'
import rehypeHighlight, {
  Options as rehypeHighlightOptions,
} from 'rehype-highlight'

import { ChatMessage } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import IconCopyDark from '@/ui/assets/img/icon-copy-dark.svg'
import IconCopyLight from '@/ui/assets/img/icon-copy-light.svg'
import IconPlugin from '@/ui/assets/img/icon-plugin.png'
import CodeBlock from '@/ui/components/CodeBlock'

type MessageProps = ComponentProps<'div'> & ChatMessage

export default function Message({ role, content, ...props }: MessageProps) {
  const [hover, setHover] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()
  const settings = useStore()

  function onMouseEnter() {
    setHover(true)
  }

  function onMouseLeave() {
    setHover(false)
  }

  function onCopyClick(event: JSX.TargetedEvent<HTMLButtonElement>) {
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
          background-color: var(--figma-color-bg);
          padding-top: var(--space-small);
          padding-right: var(--space-small);
          padding-bottom: var(--space-small);
          padding-left: var(--space-medium);
          display: flex;
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
            src={IconPlugin}
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
          margin-left: var(--space-small);
          margin-top: 8px;
          white-space: pre-wrap;
          word-break: break-word;
          flex: 1;
          overflow-x: auto;
          display: flex;
          flex-direction: column;
          row-gap: 1em;

          & *:not(a) {
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
              font-family: 'Menlo, Monaco, "Courier New", monospace';

              &::before,
              &::after {
                content: '\`';
              }
            }
          }

          ul,
          ol {
            padding-left: 1.5em;
            display: flex;
            flex-direction: column;
            gap: 0.5em;
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
                <CodeBlock node={node} className={className}>
                  {children}
                </CodeBlock>
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
          margin-left: var(--space-extra-small);
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
          visibility: ${hover ? 'visible' : 'hidden'};
          pointer-events: ${hover ? 'auto' : 'none'};
        `}
      >
        <div
          css={css`
            mix-blend-mode: ${settings.theme === 'dark'
              ? 'screen'
              : 'multiply'};

            button {
              width: 24px;
              height: 24px;
            }
          `}
        >
          <IconButton onClick={onCopyClick}>
            <img
              src={settings.theme === 'dark' ? IconCopyDark : IconCopyLight}
              css={css`
                width: 12px;
                height: auto;
              `}
            />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
