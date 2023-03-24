import * as monaco from 'monaco-editor'

import { Model, Settings } from '@/types/common'

export const SETTINGS_KEY = 'figma-gpt'

export const UI_WIDTH = 500
export const UI_HEIGHT = 0

export const DEFAULT_SETTINGS: Settings = {
  // common
  theme: 'light',
  lastOpenTab: 'Chat',
  loading: false,
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
  codeModel0324: 'text-davinci-003',
  codeMaxTokens: 1024,
  codePrompt: '',
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
    selectionHighlight: false,
    suggestLineHeight: 16.5,
    tabSize: 2,
    wordWrap: 'bounded',
  }

export const CODE_EDITOR_CDN_URL = 'https://wonderful-newton-c6b380.netlify.app'

export const CHAT_MODELS: Model[] = [
  { model: 'gpt-4', maxTokens: 8192 },
  { model: 'gpt-4-0314', maxTokens: 8192 },
  { model: 'gpt-4-32k', maxTokens: 32768 },
  { model: 'gpt-4-32k-0314', maxTokens: 32768 },
  { model: 'gpt-3.5-turbo', maxTokens: 4096 },
  { model: 'gpt-3.5-turbo-0301', maxTokens: 4096 },
]

export const CODE_MODELS: Model[] = [
  { model: 'text-davinci-003', maxTokens: 4096 },
  { model: 'text-davinci-002', maxTokens: 4096 },
  { model: 'text-curie-001', maxTokens: 2048 },
  { model: 'text-babbage-001', maxTokens: 2048 },
  { model: 'text-ada-001', maxTokens: 2048 },
  { model: 'davinci', maxTokens: 2048 },
  { model: 'curie', maxTokens: 2048 },
  { model: 'babbage', maxTokens: 2048 },
  { model: 'ada', maxTokens: 2048 },
]

export const ALL_MODELS = [...CHAT_MODELS, ...CODE_MODELS]
