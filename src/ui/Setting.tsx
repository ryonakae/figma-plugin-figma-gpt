import { ComponentProps, h, JSX } from 'preact'

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

type SettingProps = ComponentProps<'div'>

export default function Setting(props: SettingProps) {
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

  function getMaximumLength(model: Model) {
    let length: number

    if (model === 'text-davinci-003') {
      length = 4000
    } else if (model === 'code-davinci-002') {
      length = 8000
    } else {
      length = 2048
    }

    return length
  }

  return (
    <div {...props}>
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
      <div className={styles.parameterTitle}>
        <Text>
          <Muted>Parameters</Muted>
        </Text>
        <Text>
          <Link
            href="https://platform.openai.com/docs/api-reference/completions/create#completions/create-model"
            target="_blank"
          >
            Documentation
          </Link>
        </Text>
      </div>

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

      <VerticalSpace space="extraSmall" />

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

      {/* maximum length */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Maximum length</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(maxTokens)} />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={getMaximumLength(model)}
        minimum={0}
        value={String(maxTokens)}
      />

      <VerticalSpace space="extraSmall" />

      {/* stop sequences */}
      <Text>
        <Muted>Stop sequences</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Textbox variant="border" value={stop} />

      <VerticalSpace space="extraSmall" />

      {/* frequency penalty */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Frequency penalty</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(frequencyPenalty)} />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={2}
        minimum={0}
        value={String(frequencyPenalty)}
      />

      {/* presence penalty */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Presence penalty</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(presencePenalty)} />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={2}
        minimum={0}
        value={String(presencePenalty)}
      />

      {/* best of */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Best of</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(bestOf)} />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={20}
        minimum={0}
        value={String(bestOf)}
      />

      <VerticalSpace space="medium" />
    </div>
  )
}
