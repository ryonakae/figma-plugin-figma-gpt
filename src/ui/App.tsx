import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import { Tabs, TabsOption } from '@create-figma-plugin/ui'
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
import Code from '@/ui/Code'
import Setting from '@/ui/Setting'
import Store from '@/ui/Store'

const tabOptions: Array<TabsOption> = [
  { children: <Chat />, value: 'Chat' },
  { children: <Code />, value: 'Code' },
  { children: <Setting />, value: 'Setting' },
]

export default function App() {
  const { settings, setSettings } = Store.useContainer()
  const [tabValue, setTabValue] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

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
    emit<SaveSettingsHandler>('SAVE_SETTINGS', settings)
  }

  function loadSettings(settings: Settings) {
    console.log('loadSettings', settings)
    setSettings(settings)
  }

  function onTabChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setTabValue(event.currentTarget.value)
  }

  useMount(() => {
    setTabValue(tabOptions[0].value)
    resizeWindow()
    once<LoadSettingsHandler>('LOAD_SETTINGS', function (settings: Settings) {
      loadSettings(settings)
    })
  })

  useUpdateEffect(() => {
    saveSettings(settings)
  }, [settings])

  useUpdateEffect(() => {
    resizeWindow()
  }, [tabValue])

  return (
    <div ref={wrapperRef}>
      <Tabs onChange={onTabChange} options={tabOptions} value={tabValue} />
    </div>
  )
}
