/** @jsx h */
import { h, JSX, Fragment } from 'preact'
import { useRef, useState } from 'preact/hooks'

import {
  Divider,
  TextboxMultiline,
  Button,
  VerticalSpace,
  Dropdown,
  Muted,
  useInitialFocus,
  DropdownOption,
  Text,
} from '@create-figma-plugin/ui'
import { css } from '@emotion/react'
import { encode } from 'gpt-3-encoder'
import { useHotkeys } from 'react-hotkeys-hook'
import { useUpdateEffect } from 'react-use'

import { ChatModel, CodeModel } from '@/types'
import { useStore } from '@/ui/Store'
import { useSettings } from '@/ui/hooks'
import useCompletion from '@/ui/hooks/useCompletion'

type PromptProps = {
  type: 'chat' | 'code'
}

const chatModelOptions: Array<DropdownOption<ChatModel>> = [
  { value: 'gpt-3.5-turbo' },
  { value: 'gpt-3.5-turbo-0301' },
]

const codeModelOptions: Array<DropdownOption<CodeModel>> = [
  { value: 'code-davinci-002' },
  { value: 'code-cushman-001' },
]

export default function Prompt({ type }: PromptProps) {
  const settings = useStore()
  const [focusPrompt, setFocusPropmt] = useState(false)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const [promptTokens, setPromptTokens] = useState(0)
  const initialFocus = useInitialFocus()
  const { updateSettings } = useSettings()
  const { chatCompletion } = useCompletion()

  function onPromptFocus() {
    console.log('onPromptFocus')
    setFocusPropmt(true)
  }

  function onPromptBlur() {
    console.log('onPromptBlur')
    setFocusPropmt(false)
  }

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    if (type === 'chat') {
      updateSettings({ chatPrompt: event.currentTarget.value })
    } else if (type === 'code') {
      // updateSettings({ chatPrompt: event.currentTarget.value })
    }
  }

  function onModelChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    if (type === 'chat') {
      updateSettings({ chatModel: event.currentTarget.value as ChatModel })
    } else if (type === 'code') {
      updateSettings({ codeModel: event.currentTarget.value as CodeModel })
    }
  }

  function onSubmitClick() {
    if (type === 'chat') {
      chatCompletion(setLoading)
    } else if (type === 'code') {
      // codeCompletion()
    }
  }

  useHotkeys(
    ['meta+enter', 'ctrl+enter'],
    (event, handler) => {
      if (
        !focusPrompt ||
        !settings.apiKey ||
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

  useUpdateEffect(() => {
    const encodedPrompt = encode(settings.chatPrompt)
    setPromptTokens(encodedPrompt.length)
  }, [settings.chatPrompt])

  useUpdateEffect(() => {
    loadingRef.current = loading
  }, [loading])

  return (
    <Fragment>
      <Divider />

      <div
        css={css`
          padding: var(--space-extra-small) var(--space-medium);
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
              disabled={
                loading || !settings.apiKey || settings.chatPrompt.length === 0
              }
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
            {type === 'chat' && (
              <Dropdown
                onChange={onModelChange}
                options={chatModelOptions}
                value={settings.chatModel || null}
                variant="border"
                style={{
                  justifyContent: 'space-between',
                }}
              />
            )}
            {type === 'code' && (
              <Dropdown
                onChange={onModelChange}
                options={codeModelOptions}
                value={settings.codeModel || null}
                variant="border"
                style={{
                  justifyContent: 'space-between',
                }}
              />
            )}
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
    </Fragment>
  )
}
