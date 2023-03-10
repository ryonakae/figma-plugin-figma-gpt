/** @jsx h */
import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import { Link, Muted, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ReactMonacoEditor, { Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import ScrollToBottom from 'react-scroll-to-bottom'
import { useMount, useUnmount, useUpdateEffect } from 'react-use'
import * as ts from 'typescript'

import { DEFAULT_SETTINGS, EDITOR_DEFAULT_OPTIONS } from '@/constants'
import { ExecHandler, NotifyHandler } from '@/types'
import { useStore } from '@/ui/Store'
import figmaTypings from '@/ui/assets/types/figma.dts'
import Message from '@/ui/components/Message'
import Prompt from '@/ui/components/Prompt'
import { useSettings } from '@/ui/hooks'

export default function Code() {
  const settings = useStore()
  const { updateSettings } = useSettings()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>()
  const monacoRef = useRef<Monaco>()
  const modelRef = useRef<monaco.editor.ITextModel>()
  const [error, setError] = useState<monaco.editor.IMarker[]>([])
  const errorRef = useRef<monaco.editor.IMarker[]>([])
  const observerRef = useRef<MutationObserver>()
  const [editorMounted, setEditorMounted] = useState(false)

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
    updateTheme(document.documentElement)

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

  function onHtmlClassNameChange(
    mutations: MutationRecord[],
    observer: MutationObserver
  ) {
    const html = mutations[0].target as HTMLElement
    updateTheme(html)
  }

  function updateTheme(html: HTMLElement) {
    console.log('updateTheme', html)

    if (!monacoRef.current) {
      return
    }

    if (html.classList.contains('figma-dark')) {
      monacoRef.current.editor.setTheme('vs-dark')
    } else {
      monacoRef.current.editor.setTheme('light')
    }
  }

  useMount(() => {
    observerRef.current = new MutationObserver(onHtmlClassNameChange)
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  })

  useUnmount(() => {
    // destroy textModel on unmount
    if (modelRef.current) {
      modelRef.current.dispose()
    }

    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = undefined
    }
  })

  useUpdateEffect(() => {
    errorRef.current = error
  }, [error])

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
        `}
      >
        <ReactMonacoEditor
          value={settings.codeResult}
          defaultLanguage="typescript"
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={onChange}
          onValidate={onValidate}
          options={EDITOR_DEFAULT_OPTIONS}
        />
      </div>

      {/* prompt */}
      <Prompt type="code" />
    </div>
  )
}
