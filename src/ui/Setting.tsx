import { h, JSX } from 'preact'

import {
  Columns,
  Container,
  Link,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from '@create-figma-plugin/ui'

import Store from '@/ui/Store'

export default function Setting() {
  const { apiKey, setApiKey } = Store.useContainer()

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value
    setApiKey(newValue)
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      <Columns>
        <Text>
          <Muted>OpenAI API key</Muted>
        </Text>
        <Text align="right">
          <Link
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
          >
            Get API key
          </Link>
        </Text>
      </Columns>
      <VerticalSpace space="extraSmall" />
      <Textbox
        variant="border"
        value={apiKey}
        onInput={onApiKeyInput}
        password
      />

      <VerticalSpace space="medium" />
    </Container>
  )
}
