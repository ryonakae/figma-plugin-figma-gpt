import { h } from 'preact'

import { render } from '@create-figma-plugin/ui'

import App from '@/ui/App'

function Plugin() {
  return <App />
}

export default render(Plugin as any)
