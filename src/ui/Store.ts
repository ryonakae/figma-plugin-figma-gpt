import { useState } from 'preact/hooks'

import { createContainer } from 'unstated-next'

function Store() {
  const [apiKey, setApiKey] = useState('')

  return {
    apiKey,
    setApiKey,
  }
}

export default createContainer(Store)
