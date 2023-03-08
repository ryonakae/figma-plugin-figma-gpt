import { Model, Settings } from '@/types'
import { useStore } from '@/ui/Store'

export function useSettings() {
  function updateSettings(keyValue: { [T in keyof Settings]?: Settings[T] }) {
    useStore.setState({ ...useStore.getState(), ...keyValue })
  }

  function updateMaxTokens(model: Model, maxTokens: number) {
    if (model === 'code-davinci-002') {
      if (maxTokens > 8000) {
        updateSettings({ maxTokens: 8000 })
      }
    } else if (model === 'gpt-3.5-turbo' || model === 'gpt-3.5-turbo-0301') {
      if (maxTokens > 4096) {
        updateSettings({ maxTokens: 4096 })
      }
    } else if (model === 'text-davinci-003') {
      if (maxTokens > 4000) {
        updateSettings({ maxTokens: 4000 })
      }
    } else {
      if (maxTokens > 2048) {
        updateSettings({ maxTokens: 2048 })
      }
    }
  }

  return { updateSettings, updateMaxTokens }
}
