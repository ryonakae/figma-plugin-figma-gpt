import { ComponentProps, h, JSX } from 'preact'

import {
  Button,
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
import { emit } from '@create-figma-plugin/utilities'
import cx from 'classnames'
import { useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS } from '@/constants'
import { Model, NotifyHandler } from '@/types'
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
    setApiKey,
    setModel,
    setTemperature,
    setMaxTokens,
    setStop,
    setTopP,
    setFrequencyPenalty,
    setPresencePenalty,
    setBestOf,
  } = Store.useContainer()

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    setApiKey(event.currentTarget.value)
  }

  function onModelChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setModel(event.currentTarget.value as Model)
  }

  function onTemperatureChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setTemperature(Number(event.currentTarget.value))
  }

  function onMaxTokensChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setMaxTokens(Number(event.currentTarget.value))
  }

  function onStopInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    setStop(event.currentTarget.value)
  }

  function onTopPChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setTopP(Number(event.currentTarget.value))
  }

  function onFrequencyPenaltyChange(
    event: JSX.TargetedEvent<HTMLInputElement>
  ) {
    setFrequencyPenalty(Number(event.currentTarget.value))
  }

  function onPresencePenaltyChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setPresencePenalty(Number(event.currentTarget.value))
  }

  function onBestOfChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setBestOf(Number(event.currentTarget.value))
  }

  function getMaximumLength(model: Model) {
    let length: number

    if (model === 'code-davinci-002') {
      length = 8000
    } else if (model === 'text-davinci-003') {
      length = 4000
    } else {
      length = 2048
    }

    return length
  }

  function onResetClick() {
    setModel(DEFAULT_SETTINGS.model)
    setTemperature(DEFAULT_SETTINGS.temperature)
    setMaxTokens(DEFAULT_SETTINGS.maxTokens)
    setStop(DEFAULT_SETTINGS.stop)
    setFrequencyPenalty(DEFAULT_SETTINGS.frequencyPenalty)
    setPresencePenalty(DEFAULT_SETTINGS.presencePenalty)
    setBestOf(DEFAULT_SETTINGS.bestOf)

    emit<NotifyHandler>('NOTIFY', {
      message: 'Parameters reset.',
    })
  }

  // update maxTokens on model & maxTokens change
  useUpdateEffect(() => {
    if (model === 'code-davinci-002') {
      if (maxTokens > 8000) {
        setMaxTokens(8000)
      }
    } else if (model === 'text-davinci-003') {
      if (maxTokens > 4000) {
        setMaxTokens(4000)
      }
    } else {
      if (maxTokens > 2048) {
        setMaxTokens(2048)
      }
    }
  }, [model, maxTokens])

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
          <TextboxNumeric
            value={String(temperature)}
            onInput={onTemperatureChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={1}
        minimum={0}
        value={String(temperature)}
        onChange={onTemperatureChange}
      />

      {/* maximum length */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Maximum length</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric
            value={String(maxTokens)}
            onInput={onMaxTokensChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={getMaximumLength(model)}
        minimum={0}
        value={String(maxTokens)}
        onChange={onMaxTokensChange}
      />

      <VerticalSpace space="extraSmall" />

      {/* stop sequences */}
      <Text>
        <Muted>Stop sequences</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Textbox variant="border" value={stop} onInput={onStopInput} />

      <VerticalSpace space="extraSmall" />

      {/* top p */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Top P</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(topP)} onInput={onTopPChange} />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={1}
        minimum={0}
        value={String(topP)}
        onChange={onTopPChange}
      />

      {/* frequency penalty */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Frequency penalty</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric
            value={String(frequencyPenalty)}
            onInput={onFrequencyPenaltyChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={2}
        minimum={0}
        value={String(frequencyPenalty)}
        onChange={onFrequencyPenaltyChange}
      />

      {/* presence penalty */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Presence penalty</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric
            value={String(presencePenalty)}
            onInput={onPresencePenaltyChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={2}
        minimum={0}
        value={String(presencePenalty)}
        onChange={onPresencePenaltyChange}
      />

      {/* best of */}
      <div className={cx(styles.parameterTitle, styles.withRangeSlider)}>
        <Text>
          <Muted>Best of</Muted>
        </Text>
        <div className={styles.parameterTitleInput}>
          <TextboxNumeric value={String(bestOf)} onInput={onBestOfChange} />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={20}
        minimum={0}
        value={String(bestOf)}
        onChange={onBestOfChange}
      />

      <VerticalSpace space="extraSmall" />

      {/* reset button */}
      <Button fullWidth secondary onClick={onResetClick}>
        Reset parameters
      </Button>

      <VerticalSpace space="medium" />
    </div>
  )
}
