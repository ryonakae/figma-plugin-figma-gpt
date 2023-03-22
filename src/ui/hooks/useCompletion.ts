import { StateUpdater } from 'preact/hooks'

import { emit } from '@create-figma-plugin/utilities'
import { dropRight } from 'lodash'

import { DEFAULT_SETTINGS } from '@/constants'
import {
  OpenAiApiChatRequest,
  OpenAiApiChatResponse,
  OpenAiApiChatResponseAsStream,
  OpenAiApiCodeRequest,
  OpenAiApiCodeResponse,
  OpenAiApiError,
} from '@/types/api'
import { ChatMessage } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import { useSettings } from '@/ui/hooks'

export default function useCompletion() {
  const settings = useStore()
  const { updateSettings } = useSettings()

  async function chatCompletion(setLoading: StateUpdater<boolean>) {
    setLoading(true)

    const prompt = settings.chatPrompt
    const message: ChatMessage = {
      role: 'user',
      content: prompt,
    }
    const messages: ChatMessage[] = [...settings.chatMessages, message]

    updateSettings({
      chatMessages: messages,
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
        stream: true,
      } as OpenAiApiChatRequest),
    })
      .then(async response => {
        if (!response.body) {
          return
        }

        // promotを空にして、空のassistantメッセージを追加する
        updateSettings({
          chatPrompt: DEFAULT_SETTINGS.chatPrompt,
          chatMessages: [
            ...useStore.getState().chatMessages,
            {
              role: 'assistant',
              content: '',
            },
          ],
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let messageContent = ''

        function readChunk(args: { done: boolean; value?: Uint8Array }) {
          console.log('readChunk')

          if (args.done) {
            console.log('end of stream')
            return
          }

          const decodedValue = decoder.decode(args.value)
          console.log('decodedValue:')
          console.log(decodedValue)

          const strArray = decodedValue
            .trim()
            .replace(/\r?\n/g, '')
            .split('data: ')
          const dataArray: OpenAiApiChatResponseAsStream[] = []
          strArray.map((str, index) => {
            if (str.length === 0) {
              return
            } else if (str === '[DONE]') {
              return
            }

            const data = JSON.parse(str)
            dataArray.push(data)
          })

          console.log(dataArray)

          dataArray.map((data, index) => {
            const delta = data.choices[0].delta

            if (!delta.content) {
              return
            } else if (delta.role) {
              return
            } else if (delta.content && delta.content.length === 0) {
              return
            }

            messageContent += delta.content
            console.log('messageContent', messageContent)

            // chatMessagesの最後の要素を削除して、messageContentが本文になってる要素を追加し直す
            // パッと見文字が増えていくように見える
            updateSettings({
              chatMessages: [
                ...dropRight(useStore.getState().chatMessages),
                {
                  role: 'assistant',
                  content: messageContent.trim(),
                },
              ],
            })
          })

          reader.read().then(readChunk)
        }

        reader.read().then(readChunk)
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

  async function codeCompletion(setLoading: StateUpdater<boolean>) {
    setLoading(true)

    const prompt = settings.codePrompt

    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.codeModel,
        prompt: prompt,
        temperature: settings.temperature,
        max_tokens: settings.codeMaxTokens,
        stop: settings.stop,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
        echo: true,
      } as OpenAiApiCodeRequest),
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
        const data = (await response.json()) as OpenAiApiCodeResponse
        console.log(data)

        updateSettings({
          codePrompt: DEFAULT_SETTINGS.codePrompt, // promptをクリア
          codeResult: data.choices[0].text.trim(),
          codeTotalTokens: data.usage.total_tokens,
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

  return { chatCompletion, codeCompletion }
}
