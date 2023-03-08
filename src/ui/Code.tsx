/** @jsx h */
import { h, JSX } from 'preact'

import { Link, Muted, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import ScrollToBottom from 'react-scroll-to-bottom'

import { DEFAULT_SETTINGS } from '@/constants'
import { NotifyHandler } from '@/types'
import { useStore } from '@/ui/Store'
import Message from '@/ui/components/Message'
import Prompt from '@/ui/components/Prompt'
import { useSettings } from '@/ui/hooks'

export default function Code() {
  const settings = useStore()
  const { updateSettings } = useSettings()

  return (
    <div
      css={css`
        height: 500px;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* chat area */}
      <div
        css={css`
          flex: 1;
          position: relative;
        `}
      >
        code
      </div>

      {/* prompt */}
      <Prompt type="code" />
    </div>
  )
}
