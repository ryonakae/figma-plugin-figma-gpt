export type Theme = 'light' | 'dark'

export type Model = {
  model: string
  maxTokens: number
}

export type Settings = {
  // common
  theme: Theme
  lastOpenTab: string
  apiKey: string
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stop: string

  // chat
  chatModel: string
  chatMaxTokens: number
  chatPrompt: string
  chatMessages: ChatMessage[]
  chatTotalTokens: number

  // code
  codeModel0324: string
  codeMaxTokens: number
  codePrompt: string
  codeResult: string
  codeTotalTokens: number
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}
