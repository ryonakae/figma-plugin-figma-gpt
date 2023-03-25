/** @jsx h */
import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import { DropdownOption, Link, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ReactMonacoEditor, { loader, Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useUnmount, useUpdateEffect } from 'react-use'

import {
  CODE_EDITOR_DEFAULT_OPTIONS,
  CODE_EDITOR_CDN_URL,
  DEFAULT_SETTINGS,
  CODE_MODELS,
} from '@/constants'
import { Theme } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import figmaTypings from '@/ui/assets/types/figma.dts'
import CodePrompt from '@/ui/components/CodePrompt'
import useCompletion from '@/ui/hooks/useCompletion'
import useSettings from '@/ui/hooks/useSettings'

const codeModelOptions: Array<DropdownOption> = []
CODE_MODELS.map(model => {
  codeModelOptions.push({ value: model.model })
})

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
  const [editorMounted, setEditorMounted] = useState(false)
  const { codeCompletion } = useCompletion()

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

    // create model
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
      if (!editorRef.current || useStore.getState().codePrompt.length === 0) {
        console.log('submit aborted')
        return
      }
      submit()
    })

    setEditorMounted(true)
  }

  function onChange(
    value: string | undefined,
    event: monaco.editor.IModelContentChangedEvent
  ) {
    console.log('CodeEditor onChange', value, event)
    updateSettings({
      codePrompt: value,
    })
  }

  function onValidate(markers: monaco.editor.IMarker[]) {
    console.log('CodeEditor onValidate', markers)

    // severityが8のものだけをerrorに入れる
    const errors = markers.filter(marker => marker.severity === 8)

    setError(errors)
  }

  function updateTheme(theme: Theme) {
    if (!monacoRef.current) {
      return
    }

    console.log('updateTheme on CodeEditor', theme)

    if (theme === 'dark') {
      monacoRef.current.editor.setTheme('vs-dark')
    } else {
      monacoRef.current.editor.setTheme('light')
    }
  }

  function onClearClick(event: JSX.TargetedEvent<HTMLAnchorElement>) {
    event.preventDefault()

    updateSettings({
      codePrompt: DEFAULT_SETTINGS.codePrompt,
      codeTotalTokens: DEFAULT_SETTINGS.codeTotalTokens,
    })

    emit<NotifyHandler>('NOTIFY', {
      message: 'Code cleared.',
    })
  }

  function submit() {
    codeCompletion()
  }

  useUnmount(() => {
    // destroy textModel on unmount
    if (modelRef.current) {
      modelRef.current.dispose()
    }
  })

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
      {/* editor area */}
      <div
        css={css`
          flex: 1;
          opacity: ${editorMounted ? 1 : 0};
          pointer-events: ${editorMounted ? 'auto' : 'none'};
          position: relative;
        `}
      >
        <ReactMonacoEditor
          value={settings.codePrompt}
          defaultLanguage="typescript"
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={onChange}
          onValidate={onValidate}
          options={CODE_EDITOR_DEFAULT_OPTIONS}
        />

        {/* error and clear */}
        <div
          css={css`
            display: flex;
            align-items: center;
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            padding-left: var(--space-medium);
            padding-right: calc(var(--space-medium) + var(--space-extra-small));
            padding-bottom: var(--space-medium);
          `}
        >
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

          {/* spacer */}
          <div
            css={css`
              flex: 1;
            `}
          />

          {/* clear button */}
          {settings.codePrompt.length > 0 && (
            <Text>
              <Link href="#" onClick={onClearClick}>
                Clear
              </Link>
            </Text>
          )}
        </div>
      </div>

      {/* prompt */}
      <CodePrompt editor={editorRef.current} error={error} />
    </div>
  )
}
