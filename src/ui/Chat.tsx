import { h, JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

import {
  Button,
  Container,
  TextboxMultiline,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'

import { NotifyHandler, SaveSettingsHandler } from '@/types'
import Store from '@/ui/Store'

export default function Setting() {
  const { apiKey, chatPrompt, setChatPrompt } = Store.useContainer()

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const newValue = event.currentTarget.value
    setChatPrompt(newValue)
  }

  async function onSubmitClick() {
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

    setChatPrompt(chatPrompt + '\n\n' + data.choices[0].text.trim())
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      <TextboxMultiline
        variant="border"
        onInput={onPromptInput}
        value={chatPrompt}
        rows={10}
      />

      <VerticalSpace space="extraLarge" />

      <Button fullWidth onClick={onSubmitClick}>
        Submit
      </Button>

      <VerticalSpace space="medium" />
    </Container>
  )
}
