import { h, JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { render, Tabs } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'

import { UI_HEIGHT, UI_WIDTH } from '@/constants'
import { ResizeWindowHandler } from '@/types'
import Setting from '@/ui/Setting'

function Plugin() {
  const [tabValue, setTabValue] = useState<null | string>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const tabOptions = [
    { children: <div>Foo</div>, value: 'Chat' },
    { children: <div>Bar</div>, value: 'Code' },
    { children: <Setting />, value: 'Setting' },
  ]

  function onTabChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value
    setTabValue(newValue)
  }

  useEffect(() => {
    setTabValue(tabOptions[0].value)
  }, [])

  useEffect(() => {
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
  }, [tabValue])

  return (
    <div ref={wrapperRef}>
      <Tabs options={tabOptions} onChange={onTabChange} value={tabValue} />
    </div>
  )
}

export default render(Plugin)
