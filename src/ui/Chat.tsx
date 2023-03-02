import { h, JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import {
  Button,
  Container,
  Divider,
  Link,
  Muted,
  Text,
  TextboxMultiline,
  useInitialFocus,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { encode } from 'gpt-3-encoder'
import ScrollToBottom from 'react-scroll-to-bottom'
import { useCopyToClipboard, useMount, useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS } from '@/constants'
import {
  NotifyHandler,
  OpenAiApiError,
  OpenAiApiChatRequest,
  OpenAiApiChatResponse,
  OpenAiChatMessage,
} from '@/types'
import Store from '@/ui/Store'

export default function Chat() {
  const { settings, setSettings } = Store.useContainer()
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState(0)
  const initialFocus = useInitialFocus()

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const newValue = event.currentTarget.value
    setSettings({ ...settings, chatPrompt: newValue })
  }

  async function onSubmitClick() {
    setLoading(true)

    const prompt = settings.chatPrompt

    setSettings(current => {
      return {
        ...settings,
        chatMessages: [
          ...current.chatMessages,
          {
            role: 'user',
            content: prompt,
          },
        ],
        chatPrompt: '',
      }
    })

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [...settings.chatMessages, { role: 'user', content: prompt }],
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stop: settings.stop,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
      } as OpenAiApiChatRequest),
    })
      .then(async response => {
        // エラーコードが返って来た場合、エラーを投げる（catchに書いている処理を実行）
        if (!response.ok) {
          console.error('response.ok:', response.ok)
          console.error('response.status:', response.status)
          const data = (await response.json()) as OpenAiApiError
          throw new Error(data.error.message)
        }

        // 成功時の処理
        const data = (await response.json()) as OpenAiApiChatResponse
        console.log(data)

        setSettings(current => {
          return {
            ...settings,
            chatMessages: [
              ...current.chatMessages,
              {
                role: 'assistant',
                content: data.choices[0].message.content.trim(),
              },
            ],
            chatPrompt: '', // なぜかここでもクリアしないと反映されない
          }
        })
      })
      .catch((err: Error) => {
        console.log('err', err.message)
        emit<NotifyHandler>('NOTIFY', {
          message: err.message,
          options: {
            error: true,
          },
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function onClearClick(event: JSX.TargetedEvent<HTMLAnchorElement>) {
    event.preventDefault()
    setSettings({ ...settings, chatMessages: [] })
    emit<NotifyHandler>('NOTIFY', {
      message: 'Conversation cleared.',
    })
  }

  useUpdateEffect(() => {
    const encodedPrompt = encode(settings.chatPrompt)
    setTokens(encodedPrompt.length)
  }, [settings.chatPrompt])

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
        `}
      >
        <ScrollToBottom
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          `}
        >
          {settings.chatMessages.map((chatMessage, index) => {
            if (chatMessage.role === 'user') {
              return (
                <div
                  key={index}
                  css={css`
                    padding: var(--space-small) var(--space-medium);
                    display: flex;
                    gap: var(--space-small);
                    align-items: center;
                  `}
                >
                  {/* icon */}
                  <div
                    css={css`
                      width: 32px;
                      height: 32px;
                      background-color: var(--figma-color-icon-brand-tertiary);
                      border-radius: var(--border-radius-6);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                    `}
                  >
                    <Muted>You</Muted>
                  </div>
                  <span
                    css={css`
                      white-space: pre-wrap;
                      word-break: break-word;
                    `}
                  >
                    {chatMessage.content}
                  </span>
                </div>
              )
            } else if (chatMessage.role === 'assistant') {
              return (
                <div
                  key={index}
                  css={css`
                    padding: var(--space-small) var(--space-medium);
                    background-color: var(--figma-color-bg-secondary);
                    display: flex;
                    gap: var(--space-small);
                    align-items: center;
                  `}
                >
                  {/* icon */}
                  <div
                    css={css`
                      width: 32px;
                      height: 32px;
                      background-color: var(--figma-color-bg-warning-tertiary);
                      border-radius: var(--border-radius-6);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                    `}
                  >
                    <Muted>AI</Muted>
                  </div>
                  <span
                    css={css`
                      white-space: pre-wrap;
                      word-break: break-word;
                    `}
                  >
                    {chatMessage.content}
                  </span>
                </div>
              )
            }
          })}

          {settings.chatMessages.length >= 2 && (
            <div
              css={css`
                padding: var(--space-small);
                text-align: center;
              `}
            >
              <Link href="#" onClick={onClearClick}>
                Crear conversation
              </Link>
            </div>
          )}
        </ScrollToBottom>
      </div>

      <Divider />

      {/* prompt */}
      <div
        css={css`
          padding: var(--space-small) var(--space-medium);
        `}
      >
        {/* textarea and submit button */}
        <div
          css={css`
            position: relative;
          `}
        >
          {/* textarea */}
          <div
            css={css`
              textarea {
                padding-right: 95px;
                min-height: 48px;
              }
            `}
          >
            <TextboxMultiline
              {...initialFocus}
              variant="border"
              grow
              value={settings.chatPrompt}
              onInput={onPromptInput}
              placeholder="Write a tagline for an ice cream shop."
              rows={1}
            />
          </div>

          {/* submit button */}
          <div
            css={css`
              position: absolute;
              right: var(--space-extra-small);
              bottom: var(--space-extra-small);
            `}
          >
            <Button
              onClick={onSubmitClick}
              loading={loading}
              disabled={loading || settings.chatPrompt.length === 0}
            >
              Submit
            </Button>
          </div>
        </div>

        <VerticalSpace space="extraSmall" />

        {/* current model and tokens */}
        <div
          css={css`
            display: flex;
            justify-content: space-between;
          `}
        >
          <Text>
            <Muted>Model: {settings.model}</Muted>
          </Text>

          <Text>
            <Muted>Prompt: {tokens} tokens</Muted>
          </Text>
        </div>
      </div>
    </div>
  )
}
