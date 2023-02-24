import { EventHandler } from '@create-figma-plugin/utilities'

export type Model =
  | 'text-davinci-003'
  | 'text-curie-001'
  | 'text-babbage-001'
  | 'text-ada-001'
  | 'code-davinci-002'
  | 'code-cushman-001'

export type Settings = {
  apiKey: string
  model: Model
  temperature: number
  maxTokens: number
  stop: string | string[]
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  bestOf: number
  chatPrompt: string
}

export interface LoadSettingsHandler extends EventHandler {
  name: 'LOAD_SETTINGS'
  handler: (settings: Settings) => void
}

export interface SaveSettingsHandler extends EventHandler {
  name: 'SAVE_SETTINGS'
  handler: (settings: Settings) => void
}

export interface ResizeWindowHandler extends EventHandler {
  name: 'RESIZE_WINDOW'
  handler: (windowSize: { width: number; height: number }) => void
}

export interface NotifyHandler extends EventHandler {
  name: 'NOTIFY'
  handler: (options: { message: string; options?: NotificationOptions }) => void
}
