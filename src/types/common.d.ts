export type ChatModel = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0301'
export type CodeModel = 'code-davinci-002' | 'code-cushman-001'
export type TextModel =
  | 'text-davinci-003'
  | 'text-curie-001'
  | 'text-babbage-001'
  | 'text-ada-001'
export type Model = ChatModel | CodeModel | TextModel

export type Settings = {
  // common
  lastOpenTab: string
  apiKey: string
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stop: string

  // chat
  chatModel: ChatModel
  chatMaxTokens: number
  chatPrompt: string
  chatMessages: OpenAiChatMessage[]
  chatTotalTokens: number

  // code
  codeModel: CodeModel
  codeMaxTokens: number
  codePrompt: string
  codeResult: string
  codeTotalTokens: number
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

export type OpenAiApiCodeRequest = {
  model: CodeModel
  prompt: string
  temperature?: number
  top_p?: number
  stop?: string
  max_tokens?: number
  presence_penalty?: number
  frequency_penalty?: number
  echo?: boolean
}

export type OpenAiApiCodeResponse = {
  id: string
  created: number
  object: string
  model: CodeModel
  choices: {
    index: number
    text: string
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
