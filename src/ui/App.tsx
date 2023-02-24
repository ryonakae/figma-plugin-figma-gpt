import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import { Tabs } from '@create-figma-plugin/ui'
import { emit, once } from '@create-figma-plugin/utilities'
import { useMount, useUpdateEffect } from 'react-use'

import { UI_HEIGHT, UI_WIDTH } from '@/constants'
import {
  ResizeWindowHandler,
  LoadSettingsHandler,
  Settings,
  SaveSettingsHandler,
} from '@/types'
import Chat from '@/ui/Chat'
import Setting from '@/ui/Setting'
import Store from '@/ui/Store'

const tabOptions = [
  { children: <Chat />, value: 'Chat' },
  { children: <div>Bar</div>, value: 'Code' },
  { children: <Setting />, value: 'Setting' },
]

export default function App() {
  const { apiKey, chatPrompt, setApiKey, setChatPrompt } = Store.useContainer()
  const [tabValue, setTabValue] = useState<null | string>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  function onTabChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value
    setTabValue(newValue)
  }

  function resizeWindow() {
    let height: number

    if (wrapperRef.current) {
      height = wrapperRef.current.clientHeight
    } else {
      height = UI_HEIGHT
    }

    emit<ResizeWindowHandler>('RESIZE_WINDOW', {
      width: UI_WIDTH,
      height,
    })
  }

  function saveSettings(settings: Settings) {
    console.log('saveSettings', settings)
    emit<SaveSettingsHandler>('SAVE_SETTINGS', {
      apiKey: settings.apiKey,
      chatPrompt: settings.chatPrompt,
    })
  }

  function loadSettings(settings: Settings) {
    console.log('loadSettings', settings)
    setApiKey(settings.apiKey)
    setChatPrompt(settings.chatPrompt)
  }

  useMount(() => {
    setTabValue(tabOptions[0].value)

    once<LoadSettingsHandler>('LOAD_SETTINGS', function (settings: Settings) {
      loadSettings(settings)
    })
  })

  useUpdateEffect(() => {
    resizeWindow()
  }, [tabValue])

  useUpdateEffect(() => {
    saveSettings({ apiKey, chatPrompt })
  }, [apiKey, chatPrompt])

  return (
    <div ref={wrapperRef}>
      <Tabs options={tabOptions} onChange={onTabChange} value={tabValue} />
    </div>
  )
}
