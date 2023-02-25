import { h, JSX } from 'preact'

import {
  Container,
  Dropdown,
  DropdownOption,
  Link,
  Muted,
  RangeSlider,
  Text,
  Textbox,
  TextboxNumeric,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import cx from 'classnames'

import { Model } from '@/types'
import Store from '@/ui/Store'

import styles from './styles.css'

const modelOptions: Array<DropdownOption<Model>> = [
  { value: 'text-davinci-003' },
  { value: 'text-curie-001' },
  { value: 'text-babbage-001' },
  { value: 'text-ada-001' },
  { value: 'code-davinci-002' },
  { value: 'code-cushman-001' },
]

export default function Setting() {
  const {
    apiKey,
    model,
    temperature,
    maxTokens,
    stop,
    topP,
    frequencyPenalty,
    presencePenalty,
    bestOf,
    chatPrompt,
    setApiKey,
    setModel,
    setTemperature,
    setMaxTokens,
    setStop,
    setTopP,
    setFrequencyPenalty,
    setPresencePenalty,
    setBestOf,
    setChatPrompt,
  } = Store.useContainer()

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    setApiKey(event.currentTarget.value)
  }

  function onModelChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setModel(event.currentTarget.value as Model)
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      {/* api key */}
      <div className={styles.parameterTitle}>
        <Text>
          <Muted>OpenAI API key</Muted>
        </Text>
        <Text>
          <Link
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
          >
            Get API key
          </Link>
        </Text>
      </div>
      <VerticalSpace space="extraSmall" />
      <Textbox
        variant="border"
        value={apiKey}
        onInput={onApiKeyInput}
        password
      />

      <VerticalSpace space="large" />

      {/* parameters title */}
      <Text>
        <Muted>Parameters</Muted>
      </Text>

      <VerticalSpace space="medium" />

      {/* model */}
      <Text>
        <Muted>Model</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Dropdown
        onChange={onModelChange}
        options={modelOptions}
        value={model}
        variant="border"
      />

      <VerticalSpace space="medium" />

      {/* temperature */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Temperature</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(temperature)} />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={1}
        minimum={0}
        value={String(temperature)}
      />

      <VerticalSpace space="medium" />
    </Container>
  )
}
