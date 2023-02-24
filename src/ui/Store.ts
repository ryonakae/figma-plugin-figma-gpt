import { useState } from 'preact/hooks'

import { createContainer } from 'unstated-next'

import { DEFAULT_SETTINGS } from '@/constants'
import { Settings } from '@/types'

function Store() {
  const [apiKey, setApiKey] = useState<Settings['apiKey']>(
    DEFAULT_SETTINGS.apiKey
  )
  const [model, setModel] = useState<Settings['model']>(DEFAULT_SETTINGS.model)
  const [temperature, setTemperature] = useState<Settings['temperature']>(
    DEFAULT_SETTINGS.temperature
  )
  const [maxTokens, setMaxTokens] = useState<Settings['maxTokens']>(
    DEFAULT_SETTINGS.maxTokens
  )
  const [stop, setStop] = useState<Settings['stop']>(DEFAULT_SETTINGS.stop)
  const [topP, setTopP] = useState<Settings['topP']>(DEFAULT_SETTINGS.topP)
  const [frequencyPenalty, setFrequencyPenalty] = useState<
    Settings['frequencyPenalty']
  >(DEFAULT_SETTINGS.frequencyPenalty)
  const [presencePenalty, setPresencePenalty] = useState<
    Settings['presencePenalty']
  >(DEFAULT_SETTINGS.presencePenalty)
  const [bestOf, setBestOf] = useState<Settings['bestOf']>(
    DEFAULT_SETTINGS.bestOf
  )
  const [chatPrompt, setChatPrompt] = useState<Settings['chatPrompt']>(
    DEFAULT_SETTINGS.chatPrompt
  )

  return {
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
  }
}

export default createContainer(Store)
