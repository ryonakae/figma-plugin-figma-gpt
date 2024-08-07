/** @jsx h */
import { h, JSX } from 'preact'

import { Link, Muted, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ScrollToBottom from 'react-scroll-to-bottom'
import { useMount, useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS } from '@/constants'
import { Theme } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import ChatPrompt from '@/ui/components/ChatPrompt'
import Message from '@/ui/components/Message'
import useSettings from '@/ui/hooks/useSettings'

export default function Chat() {
  const settings = useStore()
  const { updateSettings } = useSettings()

  function onClearClick(event: JSX.TargetedEvent<HTMLAnchorElement>) {
    event.preventDefault()

    updateSettings({
      chatMessages: DEFAULT_SETTINGS.chatMessages,
      chatTotalTokens: DEFAULT_SETTINGS.chatTotalTokens,
    })

    emit<NotifyHandler>('NOTIFY', {
      message: 'Conversation cleared.',
    })
  }

  function updateTheme(theme: Theme) {
    console.log('updateTheme on chat', theme)

    const oldLinkTag = document.getElementById('highlightjs-theme')
    if (oldLinkTag && oldLinkTag.parentNode) {
      oldLinkTag.parentNode.removeChild(oldLinkTag)
    }

    const linkTag = document.createElement('link')
    linkTag.setAttribute('rel', 'stylesheet')
    linkTag.setAttribute('id', 'highlightjs-theme')

    if (theme === 'dark') {
      linkTag.setAttribute(
        'href',
        'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css'
      )
    } else {
      linkTag.setAttribute(
        'href',
        'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css'
      )
    }

    document.head.appendChild(linkTag)
  }

  useMount(() => {
    updateTheme(settings.theme)
  })

  useUpdateEffect(() => {
    updateTheme(settings.theme)
  }, [settings.theme])

  return (
    <div
      css={css`
        height: 500px;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* chat area */}
      <div
        css={css`
          flex: 1;
          position: relative;
          overflow: auto;
        `}
      >
        <ScrollToBottom
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            .followButton {
              display: none;
            }
          `}
          followButtonClassName="followButton"
        >
          {settings.chatMessages.map((chatMessage, index) => (
            <Message
              key={index}
              role={chatMessage.role}
              content={chatMessage.content}
            />
          ))}

          {/* clear button */}
          {settings.chatMessages.length > 0 && (
            <div
              css={css`
                padding: var(--space-extra-small);
                text-align: center;
              `}
            >
              <Link href="#" onClick={onClearClick}>
                Clear conversation
              </Link>
            </div>
          )}

          {/* empty */}
          {settings.chatMessages.length === 0 && (
            <div
              css={css`
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              {!settings.apiKey ? (
                <div
                  css={css`
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-extra-small);
                  `}
                >
                  <Text>
                    <Muted>
                      Open the Setting tab and set the OpenAI API Key.
                    </Muted>
                  </Text>
                  <Text>
                    <Link
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                    >
                      Get API key
                    </Link>
                  </Text>
                </div>
              ) : (
                <Text>
                  <Muted>Let's start a chat!</Muted>
                </Text>
              )}
            </div>
          )}
        </ScrollToBottom>
      </div>

      {/* prompt */}
      <ChatPrompt />
    </div>
  )
}
