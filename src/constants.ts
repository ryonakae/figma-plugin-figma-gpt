import { Settings } from '@/types'

export const SETTINGS_KEY = 'figma-gpt'

export const UI_WIDTH = 500
export const UI_HEIGHT = 0

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  chatModel: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1024,
  stop: '',
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  chatPrompt: '',
  chatMessages: [],
  totalTokens: 0,
}
