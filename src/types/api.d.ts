import { ChatMessage } from '@/types/common'

export type OpenAiApiChatRequest = {
  model: string
  messages: ChatMessage[]
  temperature?: number
  top_p?: number
  stop?: string
  max_tokens?: number
  presence_penalty?: number
  frequency_penalty?: number
  stream?: boolean
}

export type OpenAiApiChatResponse = {
  id: string
  created: number
  object: string
  choices: {
    index: number
    message: ChatMessage
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export type OpenAiApiChatResponseAsStream = {
  id: string
  created: number
  object: string
  model: string
  choices: {
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string
  }[]
  error?: OpenAiApiError['error']
}

export type OpenAiApiCodeRequest = {
  model: string
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
  model: string
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
