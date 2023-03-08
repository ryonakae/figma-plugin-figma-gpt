import { StateUpdater } from 'preact/hooks'

import { emit } from '@create-figma-plugin/utilities'

import {
  NotifyHandler,
  OpenAiApiChatRequest,
  OpenAiApiChatResponse,
  OpenAiApiError,
  OpenAiChatMessage,
} from '@/types'
import { useStore } from '@/ui/Store'
import { useSettings } from '@/ui/hooks'

export default function useCompletion() {
  const settings = useStore()
  const { updateSettings } = useSettings()

  async function chatCompletion(setLoading: StateUpdater<boolean>) {
    setLoading(true)

    const prompt = settings.chatPrompt
    const message: OpenAiChatMessage = {
      role: 'user',
      content: prompt,
    }
    const messages: OpenAiChatMessage[] = [...settings.chatMessages, message]

    updateSettings({
      chatMessages: messages,
      chatPrompt: '',
    })

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.chatModel,
        messages: messages,
        temperature: settings.temperature,
        max_tokens: settings.chatMaxTokens,
        stop: settings.stop,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
      } as OpenAiApiChatRequest),
    })
      .then(async response => {
        // エラーコードが返って来た場合、エラーを投げる（catchに書いている処理を実行）
        if (!response.ok) {
          console.error('response.ok:', response.ok)
          console.error('response.status:', response.status)
          const data = (await response.json()) as OpenAiApiError
          throw new Error(data.error.message) // 以降の処理は中断される
        }

        // 成功時の処理
        const data = (await response.json()) as OpenAiApiChatResponse
        console.log(data)

        updateSettings({
          chatMessages: [
            ...useStore.getState().chatMessages, // 最新のstateを取ってこないと人間のメッセージが上書きされてしまう
            {
              role: 'assistant',
              content: data.choices[0].message.content.trim(),
            },
          ],
          totalTokens: data.usage.total_tokens,
        })
      })
      .catch((err: Error) => {
        console.log('err', err.message)
        emit<NotifyHandler>('NOTIFY', {
          message: err.message,
          options: {
            error: true,
          },
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { chatCompletion }
}
