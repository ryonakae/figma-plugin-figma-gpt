import { ChatModel, CodeModel, Settings } from '@/types/common'
import { useStore } from '@/ui/Store'

export default function useSettings() {
  function updateSettings(keyValue: { [T in keyof Settings]?: Settings[T] }) {
    useStore.setState({ ...useStore.getState(), ...keyValue })
  }

  function updateChatMaxTokens(model: ChatModel) {
    const chatMaxTokens = useStore.getState().chatMaxTokens

    if (chatMaxTokens > 4096) {
      updateSettings({ chatMaxTokens: 4096 })
    }
  }

  function updateCodeMaxTokens(model: CodeModel) {
    const codeMaxTokens = useStore.getState().codeMaxTokens

    if (model === 'code-davinci-002') {
      if (codeMaxTokens > 8000) {
        updateSettings({ codeMaxTokens: 8000 })
      }
    } else {
      if (codeMaxTokens > 2048) {
        updateSettings({ codeMaxTokens: 2048 })
      }
    }
  }

  return { updateSettings, updateChatMaxTokens, updateCodeMaxTokens }
}
