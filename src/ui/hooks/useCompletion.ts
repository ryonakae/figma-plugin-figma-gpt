import { emit } from '@create-figma-plugin/utilities'
import { dropRight } from 'lodash'

import { DEFAULT_SETTINGS } from '@/constants'
import {
  OpenAiApiChatRequest,
  OpenAiApiChatResponseAsStream,
  OpenAiApiCodeRequest,
  OpenAiApiCodeResponse,
  OpenAiApiError,
} from '@/types/api'
import { ChatMessage } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import useSettings from '@/ui/hooks/useSettings'

export default function useCompletion() {
  const settings = useStore()
  const { updateSettings } = useSettings()

  function onError(err: Error) {
    console.error('err:', err.message)
    emit<NotifyHandler>('NOTIFY', {
      message: err.message,
      options: {
        error: true,
      },
    })
  }

  async function chatCompletion() {
    updateSettings({ loading: true })

    const prompt = useStore.getState().chatPrompt
    const message: ChatMessage = {
      role: 'user',
      content: prompt,
    }
    const messages: ChatMessage[] = [
      ...useStore.getState().chatMessages,
      message,
    ]

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

        async function readChunk(args: { done: boolean; value?: Uint8Array }) {
          console.log('readChunk')

          if (args.done) {
            console.log('end of stream')
            await reader.cancel()
            return
          }

          const decodedValue = decoder.decode(args.value)

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

          console.log('dataArray:', dataArray)

          // エラーハンドリング
          if (dataArray[0].error) {
            await reader.cancel()

            // promptを元に戻す
            // chatMessagesに追加した空の要素を削除
            updateSettings({
              chatPrompt: prompt,
              chatMessages: dropRight(useStore.getState().chatMessages),
            })

            throw new Error(dataArray[0].error.message)
          }

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

          reader.read().then(readChunk).catch(onError)
        }

        reader.read().then(readChunk).catch(onError)
      })
      .catch(onError)
      .finally(() => {
        updateSettings({ loading: false })
      })
  }

  async function codeCompletion() {
    updateSettings({ loading: true })

    const prompt = useStore.getState().codePrompt

    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.codeModel0324,
        prompt: prompt,
        temperature: settings.temperature,
        max_tokens: settings.codeMaxTokens,
        stop: settings.stop,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
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
          codePrompt: useStore.getState().codePrompt + data.choices[0].text, // promptに追加
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
        updateSettings({ loading: false })
      })
  }

  return { chatCompletion, codeCompletion }
}
