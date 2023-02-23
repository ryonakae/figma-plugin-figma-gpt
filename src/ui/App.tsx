import { h, JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { Tabs } from '@create-figma-plugin/ui'
import { emit, once } from '@create-figma-plugin/utilities'

import { UI_HEIGHT, UI_WIDTH } from '@/constants'
import { ResizeWindowHandler, LoadSettingsHandler, Settings } from '@/types'
import Chat from '@/ui/Chat'
import Setting from '@/ui/Setting'
import Store from '@/ui/Store'

export default function App() {
  const { setApiKey } = Store.useContainer()
  const [tabValue, setTabValue] = useState<null | string>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const tabOptions = [
    { children: <Chat />, value: 'Chat' },
    { children: <div>Bar</div>, value: 'Code' },
    { children: <Setting />, value: 'Setting' },
  ]

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

  function updateSettings(settings: Settings) {
    setApiKey(settings.apiKey)
  }

  useEffect(() => {
    setTabValue(tabOptions[0].value)

    once<LoadSettingsHandler>('LOAD_SETTINGS', function (settings: Settings) {
      updateSettings(settings)
    })
  }, [])

  useEffect(() => {
    resizeWindow()
  }, [tabValue])

  return (
    <div ref={wrapperRef}>
      <Tabs options={tabOptions} onChange={onTabChange} value={tabValue} />
    </div>
  )
}
