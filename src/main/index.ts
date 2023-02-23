import {
  once,
  showUI,
  setRelaunchButton,
  on,
} from '@create-figma-plugin/utilities'

import { UI_HEIGHT, UI_WIDTH } from '@/constants'
import { ResizeWindowHandler } from '@/types'

export default function () {
  setRelaunchButton(figma.root, 'open')

  on<ResizeWindowHandler>(
    'RESIZE_WINDOW',
    function (windowSize: { width: number; height: number }) {
      figma.ui.resize(windowSize.width, windowSize.height)
    }
  )

  showUI({
    width: UI_WIDTH,
    height: UI_HEIGHT,
  })
}
