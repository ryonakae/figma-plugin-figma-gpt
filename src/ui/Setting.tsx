import { h, JSX } from 'preact'

import {
  Button,
  Link,
  Muted,
  RangeSlider,
  Text,
  Textbox,
  TextboxNumeric,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS } from '@/constants'
import { Model, NotifyHandler } from '@/types'
import { useStore } from '@/ui/Store'
import { useSettings } from '@/ui/hooks'

export default function Setting() {
  const settings = useStore()
  const { updateSettings, updateMaxTokens } = useSettings()

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ apiKey: event.currentTarget.value })
  }

  function onTemperatureChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ temperature: Number(event.currentTarget.value) })
  }

  function onMaxTokensChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ maxTokens: Number(event.currentTarget.value) })
  }

  function onStopInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ stop: event.currentTarget.value })
  }

  function onTopPChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ topP: Number(event.currentTarget.value) })
  }

  function onFrequencyPenaltyChange(
    event: JSX.TargetedEvent<HTMLInputElement>
  ) {
    updateSettings({ frequencyPenalty: Number(event.currentTarget.value) })
  }

  function onPresencePenaltyChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ presencePenalty: Number(event.currentTarget.value) })
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
    updateSettings({
      chatModel: DEFAULT_SETTINGS.chatModel,
      temperature: DEFAULT_SETTINGS.temperature,
      maxTokens: DEFAULT_SETTINGS.maxTokens,
      stop: DEFAULT_SETTINGS.stop,
      topP: DEFAULT_SETTINGS.topP,
      frequencyPenalty: DEFAULT_SETTINGS.frequencyPenalty,
      presencePenalty: DEFAULT_SETTINGS.presencePenalty,
    })

    emit<NotifyHandler>('NOTIFY', {
      message: 'Parameters reset.',
    })
  }

  // update maxTokens on model & maxTokens change
  useUpdateEffect(() => {
    updateMaxTokens(settings.chatModel, settings.maxTokens)
  }, [settings.chatModel, settings.maxTokens])

  return (
    <div
      css={css`
        padding: var(--space-medium);
      `}
    >
      {/* api key */}
      <div className="parameterTitle">
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
        value={settings.apiKey}
        onInput={onApiKeyInput}
        password
      />

      <VerticalSpace space="large" />

      {/* parameters title */}
      <div className="parameterTitle">
        <Text>
          <Muted>Parameters</Muted>
        </Text>
        <Text>
          <Link
            href="https://platform.openai.com/docs/api-reference/chat"
            target="_blank"
          >
            Documentation
          </Link>
        </Text>
      </div>

      <VerticalSpace space="medium" />

      {/* temperature */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Temperature</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.temperature)}
            onInput={onTemperatureChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={1}
        minimum={0}
        value={String(settings.temperature)}
        onChange={onTemperatureChange}
      />

      {/* maximum length */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Maximum length</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.maxTokens)}
            onInput={onMaxTokensChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={getMaximumLength(settings.chatModel)}
        minimum={0}
        value={String(settings.maxTokens)}
        onChange={onMaxTokensChange}
      />

      <VerticalSpace space="extraSmall" />

      {/* stop sequences */}
      <Text>
        <Muted>Stop sequences</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Textbox variant="border" value={settings.stop} onInput={onStopInput} />

      <VerticalSpace space="extraSmall" />

      {/* top p */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Top P</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.topP)}
            onInput={onTopPChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={1}
        minimum={0}
        value={String(settings.topP)}
        onChange={onTopPChange}
      />

      {/* frequency penalty */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Frequency penalty</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.frequencyPenalty)}
            onInput={onFrequencyPenaltyChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={2}
        minimum={0}
        value={String(settings.frequencyPenalty)}
        onChange={onFrequencyPenaltyChange}
      />

      {/* presence penalty */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Presence penalty</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.presencePenalty)}
            onInput={onPresencePenaltyChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={0.01}
        maximum={2}
        minimum={0}
        value={String(settings.presencePenalty)}
        onChange={onPresencePenaltyChange}
      />

      <VerticalSpace space="extraSmall" />

      {/* reset button */}
      <Button fullWidth secondary onClick={onResetClick}>
        Reset parameters
      </Button>
    </div>
  )
}
