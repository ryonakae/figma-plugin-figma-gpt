import { EventHandler } from '@create-figma-plugin/utilities'

export type ChatModel = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0301'
export type CodeModel = 'code-davinci-002' | 'code-cushman-001'
export type TextModel =
  | 'text-davinci-003'
  | 'text-curie-001'
  | 'text-babbage-001'
  | 'text-ada-001'
export type Model = ChatModel | CodeModel | TextModel

export type Settings = {
  apiKey: string
  chatModel: ChatModel
  codeModel: CodeModel
  temperature: number
  chatMaxTokens: number
  codeMaxTokens: number
  stop: string
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  chatPrompt: string
  chatMessages: OpenAiChatMessage[]
  totalTokens: number
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

export interface ExecHandler extends EventHandler {
  name: 'EXEC'
  handler: (code: string) => void
}

export type OpenAiChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type OpenAiApiChatRequest = {
  model: ChatModel
  messages: OpenAiChatMessage[]
  temperature?: number
  top_p?: number
  stop?: string
  max_tokens?: number
  presence_penalty?: number
  frequency_penalty?: number
}

export type OpenAiApiChatResponse = {
  id: string
  created: number
  object: string
  choices: {
    index: number
    message: OpenAiChatMessage
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export type OpenAiApiError = {
  error: {
    message: string
    type: string
    // param?: string
    // code?: string
  }
}
