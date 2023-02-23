import { h, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'

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
import { saveSettingsAsync } from '@create-figma-plugin/utilities'

import { SETTINGS_KEY } from '@/constants'
import { Settings } from '@/types'

export default function Setting() {
  const [apiKey, setApiKey] = useState('')
  const apiKeyRef = useRef('')

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value
    setApiKey(newValue)
    apiKeyRef.current = newValue
  }

  function onSaveClick() {
    saveSettingsAsync<Settings>(
      {
        apiKey: apiKeyRef.current,
      },
      SETTINGS_KEY
    )
  }

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
