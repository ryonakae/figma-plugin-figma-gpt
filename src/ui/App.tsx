/** @jsx h */
import { h, Fragment, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

import { Tabs, TabsOption } from '@create-figma-plugin/ui'
import { emit, once } from '@create-figma-plugin/utilities'
import { css, Global } from '@emotion/react'
import { useMount, useUpdateEffect } from 'react-use'

import { UI_HEIGHT, UI_WIDTH } from '@/constants'
import { Settings } from '@/types/common'
import {
  ResizeWindowHandler,
  SaveSettingsHandler,
  LoadSettingsHandler,
} from '@/types/eventHandler'
import Chat from '@/ui/Chat'
import Code from '@/ui/Code'
import Setting from '@/ui/Setting'
import { useStore } from '@/ui/Store'
import useSettings from '@/ui/hooks/useSettings'
import useTheme from '@/ui/hooks/useTheme'

const tabOptions: Array<TabsOption> = [
  { children: <Chat />, value: 'Chat' },
  { children: <Code />, value: 'Code' },
  { children: <Setting />, value: 'Setting' },
]

export default function App() {
  const settings = useStore()
  const { updateSettings } = useSettings()
  const [tabValue, setTabValue] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { watchTheme, updateTheme } = useTheme()

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
    updateSettings(settings)
    setTabValue(settings.lastOpenTab)

    // loadingのままプラグインを閉じてしまった場合対策
    updateSettings({ loading: false })
  }

  function onTabChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const tabValue = event.currentTarget.value
    updateSettings({ lastOpenTab: tabValue })
    setTabValue(tabValue)
  }

  function loadExternalScript() {
    const script = document.createElement('script')
    script.src =
      'https://wonderful-newton-c6b380.netlify.app/typescript/typescriptServices.min.js'
    document.body.appendChild(script)
  }

  function onLoadSettings() {
    updateTheme(document.documentElement)
    watchTheme()
  }

  useMount(() => {
    loadExternalScript()
    once<LoadSettingsHandler>('LOAD_SETTINGS', function (settings: Settings) {
      loadSettings(settings)
      onLoadSettings()
    })
  })

  useUpdateEffect(() => {
    saveSettings(settings)
  }, [settings])

  useUpdateEffect(() => {
    resizeWindow()
  }, [tabValue])

  return (
    <Fragment>
      <Global
        styles={css`
          :root {
            --font-size-10: 10px;
          }

          .parameterTitle {
            display: flex;
            justify-content: space-between;
            align-items: center;

            &.withRangeSlider {
              margin-bottom: -4px;
            }
          }

          .parameterTitleInput {
            width: 52px;

            & input {
              text-align: right;
              font-variant-numeric: tabular-nums;
            }
          }
        `}
      />
      <div ref={wrapperRef}>
        <Tabs onChange={onTabChange} options={tabOptions} value={tabValue} />
      </div>
    </Fragment>
  )
}
