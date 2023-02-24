import {
  showUI,
  setRelaunchButton,
  on,
  saveSettingsAsync,
  loadSettingsAsync,
  emit,
} from '@create-figma-plugin/utilities'

import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  UI_HEIGHT,
  UI_WIDTH,
} from '@/constants'
import {
  LoadSettingsHandler,
  NotifyHandler,
  ResizeWindowHandler,
  SaveSettingsHandler,
  Settings,
} from '@/types'

export default async function () {
  setRelaunchButton(figma.root, 'open')

  showUI({
    width: UI_WIDTH,
    height: UI_HEIGHT,
  })

  on<SaveSettingsHandler>('SAVE_SETTINGS', async function (settings: Settings) {
    await saveSettingsAsync<Settings>(
      {
        apiKey: settings.apiKey,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        stop: settings.stop,
        topP: settings.topP,
        frequencyPenalty: settings.frequencyPenalty,
        presencePenalty: settings.presencePenalty,
        bestOf: settings.bestOf,
        chatPrompt: settings.chatPrompt,
      },
      SETTINGS_KEY
    )
  })

  on<ResizeWindowHandler>(
    'RESIZE_WINDOW',
    function (windowSize: { width: number; height: number }) {
      figma.ui.resize(windowSize.width, windowSize.height)
    }
  )

  on<NotifyHandler>(
    'NOTIFY',
    function (options: { message: string; options?: NotificationOptions }) {
      figma.notify(options.message, options.options)
    }
  )

  // load settings from clientStorage
  const settings = await loadSettingsAsync<Settings>(
    DEFAULT_SETTINGS,
    SETTINGS_KEY
  )
  emit<LoadSettingsHandler>('LOAD_SETTINGS', settings)
}
