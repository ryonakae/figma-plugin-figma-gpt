import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

import {
  Button,
  Container,
  TextboxMultiline,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { useCopyToClipboard } from 'react-use'

import { NotifyHandler, OpenAiApiError } from '@/types'
import Store from '@/ui/Store'

export default function Text() {
  const { settings, setSettings } = Store.useContainer()
  const [loading, setLoading] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const newValue = event.currentTarget.value
    setSettings({ ...settings, textPrompt: newValue })
  }

  async function onSubmitClick() {
    setLoading(true)

    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stop: settings.stop,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
        prompt: settings.textPrompt,
      }),
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
        const data = await response.json()
        console.log(data)

        setSettings(current => {
          return {
            ...current,
            textPrompt: current.textPrompt + '\n\n',
          }
        })

        const characterIterator = (data.choices[0].text as string)
          .trim()
          [Symbol.iterator]()
        let timerId: number

        function updatePrompt() {
          const nextCharacter = characterIterator.next()

          if (nextCharacter.done) {
            clearTimeout(timerId)
            emit<NotifyHandler>('NOTIFY', {
              message: 'Response returned.',
            })
            return
          }

          setSettings(current => {
            return {
              ...current,
              textPrompt: current.textPrompt + nextCharacter.value,
            }
          })

          timerId = setTimeout(updatePrompt, 10)
        }
        updatePrompt()
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

  function onCopyClick() {
    copyToClipboard(settings.textPrompt)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      <div
        css={css`
          position: relative;
        `}
      >
        <TextboxMultiline
          variant="border"
          value={settings.textPrompt}
          onInput={onPromptInput}
          placeholder="Write a tagline for an ice cream shop."
          rows={25}
        />
        {settings.textPrompt.length > 0 && (
          <div
            css={css`
              position: absolute;
              right: var(--space-small);
              bottom: var(--space-small);
            `}
          >
            <Button secondary disabled={loading} onClick={onCopyClick}>
              Copy
            </Button>
          </div>
        )}
      </div>
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        onClick={onSubmitClick}
        loading={loading}
        disabled={loading || settings.textPrompt.length === 0}
      >
        Submit
      </Button>

      <VerticalSpace space="medium" />
    </Container>
  )
}
