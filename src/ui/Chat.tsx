import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

import {
  Button,
  Container,
  Muted,
  Text,
  TextboxMultiline,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useCopyToClipboard } from 'react-use'

import { NotifyHandler } from '@/types'
import Store from '@/ui/Store'

export default function Setting() {
  const { apiKey, chatPrompt, setChatPrompt } = Store.useContainer()
  const [loading, setLoading] = useState(false)
  const [chatResponse, setChatResponse] = useState('')
  const [_, copyToClipboard] = useCopyToClipboard()

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const newValue = event.currentTarget.value
    setChatPrompt(newValue)
  }

  function onResponseInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const newValue = event.currentTarget.value
    setChatResponse(newValue)
  }

  async function onSubmitClick() {
    setLoading(true)

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-001',
        prompt: chatPrompt,
        max_tokens: 150, // 出力される文章量の最大値（トークン数） max:4096
        temperature: 1, // 単語のランダム性 min:0.1 max:2.0
        top_p: 1, // 単語のランダム性 min:-2.0 max:2.0
        frequency_penalty: 0.0, // 単語の再利用 min:-2.0 max:2.0
        presence_penalty: 0.6, // 単語の再利用 min:-2.0 max:2.0
        stop: [' Human:', ' AI:'], // 途中で生成を停止する単語
      }),
    })
    const data = await response.json()
    console.log(data)

    setChatResponse(data.choices[0].text.trim())
    setLoading(false)
  }

  function onCopyClick() {
    copyToClipboard(chatResponse)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      {/* prompt */}
      <Text>
        <Muted>Prompt</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <TextboxMultiline
        variant="border"
        value={chatPrompt}
        onInput={onPromptInput}
        placeholder="Write a tagline for an ice cream shop."
        rows={5}
      />
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        onClick={onSubmitClick}
        loading={loading}
        disabled={loading}
      >
        Submit
      </Button>

      <VerticalSpace space="large" />

      {/* response */}
      <Text>
        <Muted>Response</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <TextboxMultiline
        variant="border"
        value={chatResponse}
        onInput={onResponseInput}
        rows={10}
        disabled={loading}
      />
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        secondary
        disabled={loading || chatResponse.length === 0}
        onClick={onCopyClick}
      >
        Copy to clipboard
      </Button>

      <VerticalSpace space="medium" />
    </Container>
  )
}
