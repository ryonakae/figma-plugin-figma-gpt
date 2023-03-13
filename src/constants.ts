import * as monaco from 'monaco-editor'

import { Settings } from '@/types/common'

export const SETTINGS_KEY = 'figma-gpt'

export const UI_WIDTH = 500
export const UI_HEIGHT = 0

export const DEFAULT_SETTINGS: Settings = {
  // common
  apiKey: '',
  temperature: 0.7,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  stop: '',

  // chat
  chatModel: 'gpt-3.5-turbo',
  chatMaxTokens: 1024,
  chatPrompt: '',
  chatMessages: [],
  chatTotalTokens: 0,

  // code
  codeModel: 'code-davinci-002',
  codeMaxTokens: 1024,
  codePrompt: '',
  codeResult: '',
  codeTotalTokens: 0,
}

export const CODE_EDITOR_DEFAULT_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions =
  {
    cursorBlinking: 'smooth',
    folding: false,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 17.6,
    formatOnPaste: true,
    formatOnType: true,
    glyphMargin: true,
    lineDecorationsWidth: 0,
    lineNumbers: 'off',
    lineNumbersMinChars: 0,
    matchBrackets: 'near',
    minimap: {
      enabled: false,
    },
    padding: {
      top: 15,
      bottom: 15,
    },
    renderWhitespace: 'boundary',
    scrollBeyondLastColumn: 0,
    scrollBeyondLastLine: false,
    selectionHighlight: false,
    suggestLineHeight: 16.5,
    tabSize: 2,
    wordWrap: 'bounded',
  }

export const CODE_EDITOR_CDN_URL = 'https://wonderful-newton-c6b380.netlify.app'
