import { ComponentProps, h, JSX } from 'preact'
import { useState } from 'preact/hooks'

import {
  Button,
  Columns,
  Muted,
  Text,
  TextboxMultiline,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { useCopyToClipboard } from 'react-use'

import { ExecHandler, NotifyHandler, OpenAiApiError } from '@/types'
import Store from '@/ui/Store'

import styles from './styles.css'

type MainProps = ComponentProps<'div'>

export default function Main(props: MainProps) {
  const {
    apiKey,
    model,
    temperature,
    maxTokens,
    stop,
    topP,
    frequencyPenalty,
    presencePenalty,
    bestOf,
    chatPrompt,
    chatResponse,
    setChatPrompt,
    setChatResponse,
  } = Store.useContainer()
  const [loading, setLoading] = useState(false)
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

    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        temperature: temperature, // 単語のランダム性 min:0.1 max:2.0
        max_tokens: maxTokens, // 出力される文章量の最大値（トークン数） max:4096
        stop: stop, // 途中で生成を停止する単語
        top_p: topP, // 単語のランダム性 min:-2.0 max:2.0
        frequency_penalty: frequencyPenalty, // 単語の再利用 min:-2.0 max:2.0
        presence_penalty: presencePenalty, // 単語の再利用 min:-2.0 max:2.0
        best_of: bestOf,
        prompt: chatPrompt,
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
        setChatResponse(data.choices[0].text.trim())
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
    copyToClipboard(chatResponse)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  function onExecClick() {
    emit<ExecHandler>('EXEC', chatResponse)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Code has been executed.',
    })
  }

  return (
    <div {...props}>
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
        placeholder={
          model === 'code-cushman-001' || model === 'code-davinci-002'
            ? '/* Create a JavaScript dictionary of 5 countries and capitals: */'
            : 'Write a tagline for an ice cream shop.'
        }
        rows={10}
      />
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        onClick={onSubmitClick}
        loading={loading}
        disabled={loading || chatPrompt.length === 0 || apiKey.length === 0}
      >
        Submit
      </Button>

      <VerticalSpace space="large" />

      {/* response */}
      <Text>
        <Muted>Response</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <div className={styles.responseTextBox}>
        <TextboxMultiline
          variant="border"
          value={chatResponse}
          onInput={onResponseInput}
        />
      </div>
      <VerticalSpace space="extraSmall" />
      <div className={styles.responseButtons}>
        <Button
          fullWidth
          disabled={loading || chatResponse.length === 0}
          onClick={onExecClick}
        >
          Exec as code
        </Button>
        <Button
          fullWidth
          secondary
          disabled={loading || chatResponse.length === 0}
          onClick={onCopyClick}
        >
          Copy to clipboard
        </Button>
      </div>

      <VerticalSpace space="medium" />
    </div>
  )
}
