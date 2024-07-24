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
  chatModel20240724: 'gpt-4o',
  chatMaxTokens: 1024,
  chatPrompt: '',
  chatMessages: [],
  chatTotalTokens: 0,
  chatSystemMessage: '',
  chatSystemMessageTokens: 0,

  // code
  codeModel20240724: 'gpt-3.5-turbo-instruct',
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
  { model: 'gpt-4o', maxTokens: 128000 },
  { model: 'gpt-4o-mini', maxTokens: 128000 },
  { model: 'gpt-4-turbo', maxTokens: 128000 },
  { model: 'gpt-4', maxTokens: 8192 },
  { model: 'gpt-3.5-turbo', maxTokens: 16385 },
]

export const CODE_MODELS: Model[] = [
  { model: 'gpt-3.5-turbo-instruct', maxTokens: 4096 },
]

export const ALL_MODELS = [...CHAT_MODELS, ...CODE_MODELS]
