import { useState } from 'preact/hooks'

import { createContainer } from 'unstated-next'

import { DEFAULT_SETTINGS } from '@/constants'
import { Settings } from '@/types'

function Store() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  return {
    settings,
    setSettings,
  }
}

export default createContainer(Store)
