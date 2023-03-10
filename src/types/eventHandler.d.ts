import { EventHandler } from '@create-figma-plugin/utilities'

import { Settings } from '@/types/common'

export interface LoadSettingsHandler extends EventHandler {
  name: 'LOAD_SETTINGS'
  handler: (settings: Settings) => void
}

export interface SaveSettingsHandler extends EventHandler {
  name: 'SAVE_SETTINGS'
  handler: (settings: Settings) => void
}

export interface ResizeWindowHandler extends EventHandler {
  name: 'RESIZE_WINDOW'
  handler: (windowSize: { width: number; height: number }) => void
}

export interface NotifyHandler extends EventHandler {
  name: 'NOTIFY'
  handler: (options: { message: string; options?: NotificationOptions }) => void
}

export interface ExecHandler extends EventHandler {
  name: 'EXEC'
  handler: (code: string) => void
}
