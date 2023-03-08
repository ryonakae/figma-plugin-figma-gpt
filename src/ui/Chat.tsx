import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import {
  Button,
  Divider,
  Dropdown,
  DropdownOption,
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
import { useHotkeys } from 'react-hotkeys-hook'
import ScrollToBottom from 'react-scroll-to-bottom'
import { useMount, useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS } from '@/constants'
import {
  NotifyHandler,
  OpenAiApiError,
  OpenAiApiChatRequest,
  OpenAiApiChatResponse,
  OpenAiChatMessage,
  ChatModel,
} from '@/types'
import { useStore } from '@/ui/Store'
import Message from '@/ui/components/Message'
import { useSettings } from '@/ui/hooks'

const chatModelOptions: Array<DropdownOption<ChatModel>> = [
  { value: 'gpt-3.5-turbo' },
  { value: 'gpt-3.5-turbo-0301' },
]

export default function Chat() {
  const settings = useStore()
  const [focusPrompt, setFocusPropmt] = useState(false)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const [promptTokens, setPromptTokens] = useState(0)
  const initialFocus = useInitialFocus()
  const { updateSettings, updateChatMaxTokens } = useSettings()

  useHotkeys(
    ['meta+enter', 'ctrl+enter'],
    (event, handler) => {
      if (
        !focusPrompt ||
        settings.chatPrompt.length === 0 ||
        loadingRef.current
      ) {
        console.log(
          'aborted',
          focusPrompt,
          settings.chatPrompt.length,
          loadingRef.current
        )
        return
      }

      console.log('cmd + enter pressed', event, handler)
      onSubmitClick()
    },
    {
      enableOnFormTags: true,
    }
  )

  function onPromptFocus() {
    console.log('onPromptFocus')
    setFocusPropmt(true)
  }

  function onPromptBlur() {
    console.log('onPromptBlur')
    setFocusPropmt(false)
  }

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    updateSettings({ chatPrompt: event.currentTarget.value })
  }

  async function onSubmitClick() {
    setLoading(true)

    const prompt = settings.chatPrompt
    const message: OpenAiChatMessage = {
      role: 'user',
      content: prompt,
    }
    const messages: OpenAiChatMessage[] = [...settings.chatMessages, message]

    updateSettings({
      chatMessages: messages,
      chatPrompt: '',
    })

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.chatModel,
        messages: messages,
        temperature: settings.temperature,
        max_tokens: settings.chatMaxTokens,
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

        updateSettings({
          chatMessages: [
            ...useStore.getState().chatMessages, // 最新のstateを取ってこないと人間のメッセージが上書きされてしまう
            {
              role: 'assistant',
              content: data.choices[0].message.content.trim(),
            },
          ],
          totalTokens: data.usage.total_tokens,
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

    updateSettings({
      chatMessages: DEFAULT_SETTINGS.chatMessages,
      totalTokens: DEFAULT_SETTINGS.totalTokens,
    })

    emit<NotifyHandler>('NOTIFY', {
      message: 'Conversation cleared.',
    })
  }

  function onChatModelChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ chatModel: event.currentTarget.value as ChatModel })
  }

  useMount(() => {
    updateChatMaxTokens(settings.chatModel)
  })

  useUpdateEffect(() => {
    updateChatMaxTokens(settings.chatModel)
  }, [settings.chatModel])

  useUpdateEffect(() => {
    const encodedPrompt = encode(settings.chatPrompt)
    setPromptTokens(encodedPrompt.length)
  }, [settings.chatPrompt])

  useUpdateEffect(() => {
    loadingRef.current = loading
  }, [loading])

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
              <Text>
                <Muted>Let's start a chat!</Muted>
              </Text>
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
            onFocus={onPromptFocus}
            onBlur={onPromptBlur}
          >
            <TextboxMultiline
              {...initialFocus}
              variant="border"
              grow
              value={settings.chatPrompt}
              onInput={onPromptInput}
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
            align-items: center;
          `}
        >
          <div
            css={css`
              width: 150px;
            `}
          >
            <Dropdown
              onChange={onChatModelChange}
              options={chatModelOptions}
              value={settings.chatModel || null}
              variant="border"
              style={{
                justifyContent: 'space-between',
              }}
            />
          </div>

          <Text>
            <Muted>
              <span
                css={css`
                  font-variant-numeric: tabular-nums;
                `}
              >
                Prompt: {promptTokens} tokens / Total: {settings.totalTokens}{' '}
                tokens
              </span>
            </Muted>
          </Text>
        </div>
      </div>
    </div>
  )
}
