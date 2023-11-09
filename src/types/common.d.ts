export type Theme = 'light' | 'dark'

export type Model = {
  model: string
  maxTokens: number
}

export type Settings = {
  // common
  theme: Theme
  lastOpenTab: string
  loading: boolean
  apiKey: string
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stop: string

  // chat
  chatModel20231109: string
  chatMaxTokens: number
  chatPrompt: string
  chatMessages: ChatMessage[]
  chatTotalTokens: number
  chatSystemMessage: string
  chatSystemMessageTokens: number

  // code
  codeModel20231109: string
  codeMaxTokens: number
  codePrompt: string
  codeTotalTokens: number
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}
