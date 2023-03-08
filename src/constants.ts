import { Settings } from '@/types'

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
  codeTotalTokens: 0,
}
