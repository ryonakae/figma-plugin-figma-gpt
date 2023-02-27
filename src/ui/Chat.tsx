import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

import {
  Button,
  Container,
  TextboxMultiline,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useCopyToClipboard } from 'react-use'

import { NotifyHandler, OpenAiApiError } from '@/types'
import Store from '@/ui/Store'

export default function Chat() {
  const { settings, setSettings } = Store.useContainer()
  const [loading, setLoading] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const newValue = event.currentTarget.value
    setSettings({ ...settings, chatPrompt: newValue })
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
        temperature: settings.temperature, // 単語のランダム性 min:0.1 max:2.0
        max_tokens: settings.maxTokens, // 出力される文章量の最大値（トークン数） max:4096
        stop: settings.stop, // 途中で生成を停止する単語
        top_p: settings.topP, // 単語のランダム性 min:-2.0 max:2.0
        frequency_penalty: settings.frequencyPenalty, // 単語の再利用 min:-2.0 max:2.0
        presence_penalty: settings.presencePenalty, // 単語の再利用 min:-2.0 max:2.0
        best_of: settings.bestOf,
        prompt: settings.chatPrompt,
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
        setSettings({
          ...settings,
          chatPrompt:
            settings.chatPrompt + '\n\n' + data.choices[0].text.trim(),
        })
        emit<NotifyHandler>('NOTIFY', {
          message: 'Response returned.',
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

  function onCopyClick() {
    copyToClipboard(settings.chatPrompt)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      <TextboxMultiline
        variant="border"
        value={settings.chatPrompt}
        onInput={onPromptInput}
        placeholder="Write a tagline for an ice cream shop."
        rows={25}
      />
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        onClick={onSubmitClick}
        loading={loading}
        disabled={
          loading ||
          settings.chatPrompt.length === 0 ||
          settings.apiKey.length === 0
        }
      >
        Submit
      </Button>
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        secondary
        disabled={loading || settings.chatPrompt.length === 0}
        onClick={onCopyClick}
      >
        Copy to clipboard
      </Button>

      <VerticalSpace space="medium" />
    </Container>
  )
}
