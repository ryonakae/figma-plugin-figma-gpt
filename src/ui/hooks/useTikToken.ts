import { TiktokenModel, encodingForModel } from 'js-tiktoken'

import { ChatMessage } from '@/types/common'

export default function useTikToken() {
  function getTokensFromString(str: string, model: TiktokenModel) {
    const enc = encodingForModel(model)
    const tokens = enc.encode(str)
    return tokens
  }

  function getTokensFromChatMessages(
    chatMessages: ChatMessage[],
    model: TiktokenModel
  ) {
    const chatMessagesString = chatMessages.reduce(
      (acc, cur) => acc + cur.content,
      ''
    )
    const enc = encodingForModel(model)
    const tokens = enc.encode(chatMessagesString)
    return tokens
  }

  return { getTokensFromString, getTokensFromChatMessages }
}
