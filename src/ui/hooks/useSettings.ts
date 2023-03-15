import { ALL_MODELS } from '@/constants'
import { Settings } from '@/types/common'
import { useStore } from '@/ui/Store'

export default function useSettings() {
  function updateSettings(keyValue: { [T in keyof Settings]?: Settings[T] }) {
    useStore.setState({ ...useStore.getState(), ...keyValue })
  }

  function updateMaxTokens(options: { type: 'chat' | 'code'; model: string }) {
    const targetModel = ALL_MODELS.find(model => {
      return model.model === options.model
    })

    if (!targetModel) {
      return
    }

    let currentMaxTokens = 0
    if (options.type === 'chat') {
      currentMaxTokens = useStore.getState().chatMaxTokens
    } else if (options.type === 'code') {
      currentMaxTokens = useStore.getState().codeMaxTokens
    }

    if (currentMaxTokens > targetModel.maxTokens) {
      if (options.type === 'chat') {
        updateSettings({ chatMaxTokens: targetModel.maxTokens })
      } else if (options.type === 'code') {
        updateSettings({ codeMaxTokens: targetModel.maxTokens })
      }
    }
  }

  return { updateSettings, updateMaxTokens }
}
