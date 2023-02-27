import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

import {
  Button,
  Container,
  Muted,
  Text,
  TextboxMultiline,
  Toggle,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { highlight, languages } from 'prismjs'
import Editor from 'react-simple-code-editor'
import { useCopyToClipboard } from 'react-use'

import { ExecHandler, NotifyHandler, OpenAiApiError } from '@/types'
import Store from '@/ui/Store'

import '!prismjs/themes/prism.css'

export default function Main() {
  const { settings, setSettings } = Store.useContainer()
  const [loading, setLoading] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()

  function onPromptInput(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    setSettings({ ...settings, codePrompt: event.currentTarget.value })
  }

  function onSpecializedChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setSettings({
      ...settings,
      codePromptSpecialize: event.currentTarget.checked,
    })
  }

  async function onSubmitClick() {
    setLoading(true)

    let prompt: string
    if (settings.codePromptSpecialize) {
      prompt = `Please generate code in JavaScript to execute the following content.
      "${settings.codePrompt}".
      To generate code, use the functions described in the Figma Plugin API documentation (https://www.figma.com/plugin-docs/api/figma).`
    } else {
      prompt = settings.codePrompt
    }

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
        prompt: prompt,
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
        setSettings({ ...settings, codeResponse: data.choices[0].text.trim() })
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
    copyToClipboard(settings.codeResponse)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  function onExecClick() {
    emit<ExecHandler>('EXEC', settings.codeResponse)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Code has been executed.',
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
        value={settings.codePrompt}
        onInput={onPromptInput}
        placeholder="Create a JavaScript dictionary of 5 countries and capitals."
        rows={5}
      />
      <VerticalSpace space="extraSmall" />
      <Toggle
        value={settings.codePromptSpecialize}
        onChange={onSpecializedChange}
      >
        <Text>Mode for generating Figma Plugin API code</Text>
      </Toggle>
      <VerticalSpace space="extraSmall" />
      <Button
        fullWidth
        onClick={onSubmitClick}
        loading={loading}
        disabled={
          loading ||
          settings.codePrompt.length === 0 ||
          settings.apiKey.length === 0
        }
      >
        Submit
      </Button>

      <VerticalSpace space="large" />

      {/* response */}
      <Text>
        <Muted>Response</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <div
        css={css`
          font-family: var(--font-family-code);
          font-size: var(--font-size-11);
          height: 300px;
          overflow: auto;
          padding: 6px var(--space-extra-small) 6px var(--space-extra-small);
          border: 1px solid var(--figma-color-border);
          border-radius: var(--border-radius-2);
          background-color: transparent;

          .react-simple-code-editor__pre,
          .react-simple-code-editor__textarea {
            position: relative;
            min-height: 100%;
          }

          .react-simple-code-editor__pre {
            z-index: 2;

            pre,
            code {
              white-space: pre-wrap !important;
            }
          }

          .react-simple-code-editor__textarea {
            z-index: 1;
          }
        `}
      >
        <Editor
          value={settings.codeResponse}
          onValueChange={(code: string) =>
            setSettings({ ...settings, codeResponse: code })
          }
          highlight={(code: string) => highlight(code, languages.js, 'js')}
          padding={0}
          preClassName="react-simple-code-editor__pre"
          textareaClassName="react-simple-code-editor__textarea"
          spellcheck={false}
        />
      </div>
      <VerticalSpace space="extraSmall" />
      <div
        css={css`
          display: flex;
          gap: var(--space-extra-small);

          & > * {
            flex: 1;
          }
        `}
      >
        <Button
          fullWidth
          disabled={loading || settings.codeResponse.length === 0}
          onClick={onExecClick}
        >
          Exec as code
        </Button>
        <Button
          fullWidth
          secondary
          disabled={loading || settings.codeResponse.length === 0}
          onClick={onCopyClick}
        >
          Copy to clipboard
        </Button>
      </div>

      <VerticalSpace space="medium" />
    </Container>
  )
}
