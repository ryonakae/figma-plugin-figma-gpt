/** @jsx h */
import { h, Fragment, JSX } from 'preact'
import { useState } from 'preact/hooks'

import {
  Button,
  Divider,
  Dropdown,
  DropdownOption,
  Link,
  Muted,
  Text,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import * as monaco from 'monaco-editor'
import { useCopyToClipboard, useMount, useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS, CODE_MODELS } from '@/constants'
import { ExecHandler, NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import useCompletion from '@/ui/hooks/useCompletion'
import useSettings from '@/ui/hooks/useSettings'
import useTikToken from '@/ui/hooks/useTikToken'

type CodePromptProps = {
  editor: monaco.editor.IStandaloneCodeEditor | undefined
  error: monaco.editor.IMarker[]
}

const codeModelOptions: Array<DropdownOption> = []
CODE_MODELS.map(model => {
  codeModelOptions.push({ value: model.model })
})

export default function CodePrompt({ editor, error }: CodePromptProps) {
  const settings = useStore()
  const [tokens, setTokens] = useState(0)
  const { updateSettings, updateMaxTokens } = useSettings()
  const [_, copyToClipboard] = useCopyToClipboard()
  const { codeCompletion } = useCompletion()
  const { getTokensFromString } = useTikToken()

  function exec() {
    if (!editor) {
      return
    }

    console.log('exec')

    const tsCode = editor.getValue()
    console.log(tsCode)
    const jsCode = ts.transpile(tsCode)
    console.log(jsCode)

    emit<ExecHandler>('EXEC', jsCode)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Code has been executed.',
    })
  }

  function onCopyClick() {
    copyToClipboard(settings.codePrompt)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  function onModelChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const model = event.currentTarget.value
    updateSettings({ codeModel20231109: model })
    updateMaxTokens({ type: 'code', model: model })
  }

  function submit() {
    codeCompletion()
  }

  function updateTokens(prompt: string) {
    // const tokens = getTokensFromString(
    //   prompt,
    //   settings.codeModel20231109 as TiktokenModel
    // )
    const tokens = getTokensFromString(prompt, 'gpt-3.5-turbo')
    setTokens(tokens.length)
  }

  useMount(() => {
    updateTokens(settings.codePrompt)
  })

  useUpdateEffect(() => {
    updateTokens(settings.codePrompt)
  }, [settings.codePrompt, settings.codeTotalTokens])

  return (
    <Fragment>
      <Divider />

      {/* buttons */}
      <div
        css={css`
          padding: var(--space-extra-small) var(--space-medium);
          display: flex;
          gap: var(--space-extra-small);
          align-items: center;
        `}
      >
        {/* copy button */}
        <Button
          secondary
          onClick={onCopyClick}
          disabled={!editor || settings.codePrompt.length === 0}
        >
          Copy
        </Button>

        {/* exec button */}
        <Button
          onClick={exec}
          disabled={
            !editor || settings.codePrompt.length === 0 || error.length > 0
          }
        >
          Exec
        </Button>

        {/* spacer */}
        <div
          css={css`
            flex: 1;
          `}
        />

        {/* help link */}
        <Text>
          <Link href="https://www.figma.com/plugin-docs/" target="_blank">
            Figma Plugin API docs
          </Link>
        </Text>

        {/* submit button */}
        <div
          css={css`
            width: 72px;
          `}
        >
          <Button
            fullWidth
            onClick={submit}
            loading={settings.loading}
            disabled={
              settings.loading ||
              !settings.apiKey ||
              settings.codePrompt.length === 0
            }
          >
            Submit
          </Button>
        </div>
      </div>

      <Divider />

      {/* current model and tokens */}
      <div
        css={css`
          padding: var(--space-extra-small) var(--space-medium);
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        {/* model */}
        <div
          css={css`
            width: 144px;
          `}
        >
          <Dropdown
            onChange={onModelChange}
            options={codeModelOptions}
            value={
              settings.codeModel20231109 || DEFAULT_SETTINGS.codeModel20231109
            }
            variant="border"
            style={{
              justifyContent: 'space-between',
            }}
          />
        </div>

        {/* tokens */}
        <Text>
          <Muted>
            <span
              css={css`
                font-variant-numeric: tabular-nums;
              `}
            >
              {tokens} tokens
            </span>
          </Muted>
        </Text>
      </div>
    </Fragment>
  )
}
