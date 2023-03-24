/** @jsx h */
import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import { Button, Link, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ReactMonacoEditor, { loader, Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import {
  useCopyToClipboard,
  useMount,
  useUnmount,
  useUpdateEffect,
} from 'react-use'

import {
  CODE_EDITOR_DEFAULT_OPTIONS,
  CODE_EDITOR_CDN_URL,
  DEFAULT_SETTINGS,
} from '@/constants'
import { Theme } from '@/types/common'
import { ExecHandler, NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import figmaTypings from '@/ui/assets/types/figma.dts'
import Prompt from '@/ui/components/Prompt'
import useSettings from '@/ui/hooks/useSettings'
import useTheme from '@/ui/hooks/useTheme'

loader.config({
  paths: {
    vs: CODE_EDITOR_CDN_URL + '/min/vs',
  },
})

export default function Code() {
  const settings = useStore()
  const { updateSettings } = useSettings()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>()
  const monacoRef = useRef<Monaco>()
  const modelRef = useRef<monaco.editor.ITextModel>()
  const [error, setError] = useState<monaco.editor.IMarker[]>([])
  const errorRef = useRef<monaco.editor.IMarker[]>([])
  const [editorMounted, setEditorMounted] = useState(false)
  const [_, copyToClipboard] = useCopyToClipboard()

  function beforeMount(monaco: Monaco) {
    console.log('CodeEditor beforeMount', monaco)

    // refに引数を入れて他の場所で参照できるようにする
    monacoRef.current = monaco

    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      noEmit: true,
    })

    // add external libraries (figma typings)
    const libSource = figmaTypings
    const libUri = 'ts:filename/figma.d.ts'
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      libUri
    )

    // When resolving definitions and references, the editor will try to use created models.
    // Creating a model for the library allows "peek definition/references" commands to work with the library.
    modelRef.current = monaco.editor.createModel(
      libSource,
      'typescript',
      monaco.Uri.parse(libUri)
    )
  }

  function onMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    console.log('CodeEditor onMount', editor, monaco)

    // refに引数を入れて他の場所で参照できるようにする
    editorRef.current = editor

    // テーマの更新
    updateTheme(settings.theme)

    // キーボードショートカットの設定
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handler => {
      console.log('CodeEditor cmd + enter pressed at inner of editor', handler)
      exec()
    })

    setEditorMounted(true)
  }

  function onChange(
    value: string | undefined,
    event: monaco.editor.IModelContentChangedEvent
  ) {
    console.log('CodeEditor onChange', value, event)
    updateSettings({
      codeResult: value || '',
    })
  }

  function onValidate(markers: monaco.editor.IMarker[]) {
    console.log('CodeEditor onValidate', markers)
    setError(markers)
  }

  function exec() {
    if (
      !editorRef.current ||
      settings.codeResult.length === 0 ||
      errorRef.current.length > 0
    ) {
      console.log('exec aborted')
      return
    }

    console.log('exec')

    const tsCode = editorRef.current.getValue()
    console.log(tsCode)
    const jsCode = ts.transpile(tsCode)
    console.log(jsCode)

    emit<ExecHandler>('EXEC', jsCode)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Code has been executed.',
    })
  }

  function copy() {
    copyToClipboard(settings.codeResult)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  function updateTheme(theme: Theme) {
    if (!monacoRef.current) {
      return
    }

    if (theme === 'dark') {
      monacoRef.current.editor.setTheme('vs-dark')
    } else {
      monacoRef.current.editor.setTheme('light')
    }
  }

  function onClearClick(event: JSX.TargetedEvent<HTMLAnchorElement>) {
    event.preventDefault()

    updateSettings({
      codeResult: DEFAULT_SETTINGS.codeResult,
      codeTotalTokens: DEFAULT_SETTINGS.codeTotalTokens,
    })

    emit<NotifyHandler>('NOTIFY', {
      message: 'Code cleared.',
    })
  }

  useUnmount(() => {
    // destroy textModel on unmount
    if (modelRef.current) {
      modelRef.current.dispose()
    }
  })

  useUpdateEffect(() => {
    errorRef.current = error
  }, [error])

  useUpdateEffect(() => {
    updateTheme(settings.theme)
  }, [settings.theme])

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
          opacity: ${editorMounted ? 1 : 0};
          position: relative;
        `}
      >
        <ReactMonacoEditor
          value={settings.codeResult}
          defaultLanguage="typescript"
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={onChange}
          onValidate={onValidate}
          options={CODE_EDITOR_DEFAULT_OPTIONS}
        />

        {/* buttons */}
        <div
          css={css`
            display: flex;
            gap: var(--space-extra-small);
            align-items: center;
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            padding-left: var(--space-medium);
            padding-right: calc(var(--space-medium) + var(--space-extra-small));
            padding-bottom: var(--space-extra-small);
          `}
        >
          {/* clear button */}
          {settings.codeResult.length > 0 && (
            <Text>
              <Link href="#" onClick={onClearClick}>
                Clear code
              </Link>
            </Text>
          )}

          {/* spacer */}
          <div
            css={css`
              flex: 1;
            `}
          />

          {/* error count */}
          {error.length > 0 && (
            <Text>
              <span
                css={css`
                  font-variant-numeric: tabular-nums;
                  color: var(--figma-color-text-danger);
                `}
              >
                {error.length} problems
              </span>
            </Text>
          )}

          {/* copy button */}
          <Button
            secondary
            onClick={copy}
            disabled={!editorRef.current || settings.codeResult.length === 0}
          >
            Copy
          </Button>

          {/* exec button */}
          <Button
            onClick={exec}
            disabled={
              !editorRef.current ||
              settings.codeResult.length === 0 ||
              error.length > 0
            }
          >
            Exec
          </Button>
        </div>
      </div>

      {/* prompt */}
      <Prompt type="code" />
    </div>
  )
}
