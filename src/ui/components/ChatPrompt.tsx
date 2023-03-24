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

import { CHAT_MODELS, DEFAULT_SETTINGS } from '@/constants'
import { useStore } from '@/ui/Store'
import useCompletion from '@/ui/hooks/useCompletion'
import useSettings from '@/ui/hooks/useSettings'

const chatModelOptions: Array<DropdownOption> = []
CHAT_MODELS.map(model => {
  chatModelOptions.push({ value: model.model })
})

export default function Prompt() {
  const settings = useStore()
  const [focusPrompt, setFocusPropmt] = useState(false)
  const [promptTokens, setPromptTokens] = useState(0)
  const initialFocus = useInitialFocus()
  const { updateSettings, updateMaxTokens } = useSettings()
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
    updateSettings({ chatPrompt: event.currentTarget.value })
  }

  function onModelChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const model = event.currentTarget.value
    updateSettings({ chatModel: model })
    updateMaxTokens({ type: 'chat', model: model })
  }

  function onSubmitClick() {
    chatCompletion()
  }

  useHotkeys(
    ['meta+enter', 'ctrl+enter'],
    (event, handler) => {
      const length = settings.chatPrompt.length

      if (
        !focusPrompt ||
        !settings.apiKey ||
        length === 0 ||
        useStore.getState().loading
      ) {
        console.log('aborted')
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
              & > div {
                div:first-of-type,
                textarea {
                  padding-right: 88px;
                  min-height: 48px;
                }
              }

              & textarea {
                cursor: text;
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
              disabled={settings.loading}
              placeholder="Think of a tagline for the corporate website."
            />
          </div>

          {/* submit button */}
          <div
            css={css`
              position: absolute;
              right: var(--space-extra-small);
              bottom: var(--space-extra-small);
              width: 72px;
            `}
          >
            <Button
              fullWidth
              onClick={onSubmitClick}
              loading={settings.loading}
              disabled={
                settings.loading ||
                !settings.apiKey ||
                settings.chatPrompt.length === 0
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
              width: 144px;
            `}
          >
            <Dropdown
              onChange={onModelChange}
              options={chatModelOptions}
              value={settings.chatModel || DEFAULT_SETTINGS.chatModel}
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
                  display: flex;
                  gap: 0.5em;
                `}
              >
                <span>Prompt: {promptTokens} tokens</span>
                <span>/</span>
                <span>Total: {settings.chatTotalTokens} tokens</span>
              </span>
            </Muted>
          </Text>
        </div>
      </div>
    </Fragment>
  )
}
