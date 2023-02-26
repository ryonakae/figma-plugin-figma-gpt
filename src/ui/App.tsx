import { h } from 'preact'
import { useRef } from 'preact/hooks'

import { Container } from '@create-figma-plugin/ui'
import { emit, once } from '@create-figma-plugin/utilities'
import { useMount, useUpdateEffect } from 'react-use'

import { UI_HEIGHT, UI_WIDTH } from '@/constants'
import {
  ResizeWindowHandler,
  LoadSettingsHandler,
  Settings,
  SaveSettingsHandler,
} from '@/types'
import Main from '@/ui/Main'
import Setting from '@/ui/Setting'
import Store from '@/ui/Store'

import styles from './styles.css'

export default function App() {
  const {
    apiKey,
    model,
    temperature,
    maxTokens,
    stop,
    topP,
    frequencyPenalty,
    presencePenalty,
    bestOf,
    chatPrompt,
    setApiKey,
    setModel,
    setTemperature,
    setMaxTokens,
    setStop,
    setTopP,
    setFrequencyPenalty,
    setPresencePenalty,
    setBestOf,
    setChatPrompt,
  } = Store.useContainer()
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
    emit<SaveSettingsHandler>('SAVE_SETTINGS', {
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
    })
  }

  function loadSettings(settings: Settings) {
    console.log('loadSettings', settings)
    setApiKey(settings.apiKey)
    setModel(settings.model)
    setTemperature(settings.temperature)
    setMaxTokens(settings.maxTokens)
    setStop(settings.stop)
    setTopP(settings.topP)
    setFrequencyPenalty(settings.frequencyPenalty)
    setPresencePenalty(settings.presencePenalty)
    setBestOf(settings.bestOf)
    setChatPrompt(settings.chatPrompt)
  }

  useMount(() => {
    resizeWindow()
    once<LoadSettingsHandler>('LOAD_SETTINGS', function (settings: Settings) {
      loadSettings(settings)
    })
  })

  useUpdateEffect(() => {
    saveSettings({
      apiKey,
      model,
      temperature,
      maxTokens,
      stop,
      topP,
      frequencyPenalty,
      presencePenalty,
      bestOf,
      chatPrompt,
    })
  }, [
    apiKey,
    model,
    temperature,
    maxTokens,
    stop,
    topP,
    frequencyPenalty,
    presencePenalty,
    bestOf,
    chatPrompt,
  ])

  return (
    <div ref={wrapperRef}>
      <Container space="medium">
        <div className={styles.columns}>
          <Main className={styles.main} />
          <Setting className={styles.setting} />
        </div>
      </Container>
    </div>
  )
}
