import { h } from 'preact'

import { render } from '@create-figma-plugin/ui'

import App from '@/ui/App'
import Store from '@/ui/Store'

function Plugin() {
  return (
    <Store.Provider>
      <App />
    </Store.Provider>
  )
}

export default render(Plugin as any)
