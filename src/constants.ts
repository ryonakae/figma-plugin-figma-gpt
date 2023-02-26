import { Settings } from '@/types'

export const SETTINGS_KEY = 'figma-gpt'

export const UI_WIDTH = 600
export const UI_HEIGHT = 0

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'text-ada-001',
  temperature: 0.7,
  maxTokens: 256,
  stop: '',
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  bestOf: 1,
  chatPrompt: '',
}
