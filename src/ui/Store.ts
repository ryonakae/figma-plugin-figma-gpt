import { useState } from 'preact/hooks'

import { createContainer } from 'unstated-next'

function Store() {
  const [apiKey, setApiKey] = useState('')
  const [chatPrompt, setChatPrompt] = useState('')

  return {
    apiKey,
    chatPrompt,
    setApiKey,
    setChatPrompt,
  }
}

export default createContainer(Store)
