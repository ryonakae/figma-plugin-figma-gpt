import { h, JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import {
  Button,
  Columns,
  Container,
  Link,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'

import { NotifyHandler, SaveSettingsHandler } from '@/types'
import Store from '@/ui/Store'

export default function Setting() {
  const { apiKey, setApiKey } = Store.useContainer()
  const apiKeyRef = useRef('')

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value
    setApiKey(newValue)
    apiKeyRef.current = newValue
  }

  function onSaveClick() {
    console.log(apiKeyRef.current)
    emit<SaveSettingsHandler>('SAVE_SETTINGS', {
      apiKey: apiKeyRef.current,
    })
    emit<NotifyHandler>('NOTIFY', {
      message: 'Setting Saved.',
    })
  }

  useEffect(() => {
    apiKeyRef.current = apiKey
  }, [apiKey])

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      <Columns>
        <Text>
          <Muted>OpenAI API Key</Muted>
        </Text>
        <Text align="right">
          <Link
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
          >
            Get API Key
          </Link>
        </Text>
      </Columns>
      <VerticalSpace space="small" />
      <Textbox variant="border" value={apiKey} onInput={onApiKeyInput} />

      <VerticalSpace space="extraLarge" />

      <Button fullWidth onClick={onSaveClick}>
        Save
      </Button>

      <VerticalSpace space="medium" />
    </Container>
  )
}
