/** @jsx h */
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
import { useMount, useUpdateEffect } from 'react-use'

import { DEFAULT_SETTINGS } from '@/constants'
import { Model } from '@/types/common'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import { useSettings } from '@/ui/hooks'

export default function Setting() {
  const settings = useStore()
  const { updateSettings, updateChatMaxTokens, updateCodeMaxTokens } =
    useSettings()

  function onApiKeyInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ apiKey: event.currentTarget.value })
  }

  function onTemperatureChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ temperature: Number(event.currentTarget.value) })
  }

  function onChatMaxTokensChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ chatMaxTokens: Number(event.currentTarget.value) })
  }

  function onCodeMaxTokensChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    updateSettings({ codeMaxTokens: Number(event.currentTarget.value) })
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
    } else if (model === 'gpt-3.5-turbo' || model === 'gpt-3.5-turbo-0301') {
      length = 4096
    } else if (model === 'text-davinci-003') {
      length = 4000
    } else {
      length = 2048
    }

    return length
  }

  function onResetClick() {
    updateSettings({
      temperature: DEFAULT_SETTINGS.temperature,
      chatMaxTokens: DEFAULT_SETTINGS.chatMaxTokens,
      codeMaxTokens: DEFAULT_SETTINGS.codeMaxTokens,
      stop: DEFAULT_SETTINGS.stop,
      topP: DEFAULT_SETTINGS.topP,
      frequencyPenalty: DEFAULT_SETTINGS.frequencyPenalty,
      presencePenalty: DEFAULT_SETTINGS.presencePenalty,
    })

    emit<NotifyHandler>('NOTIFY', {
      message: 'Parameters reset.',
    })
  }

  useMount(() => {
    updateChatMaxTokens(settings.chatModel)
    updateCodeMaxTokens(settings.codeModel)
  })

  useUpdateEffect(() => {
    updateChatMaxTokens(settings.chatModel)
    updateCodeMaxTokens(settings.codeModel)
  }, [settings.chatModel, settings.codeModel])

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

      {/* maximum length (chat) */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Maximum length (Chat)</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.chatMaxTokens)}
            onInput={onChatMaxTokensChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={getMaximumLength(settings.chatModel)}
        minimum={0}
        value={String(settings.chatMaxTokens)}
        onChange={onChatMaxTokensChange}
      />

      {/* maximum length (code) */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Maximum length (Code)</Muted>
        </Text>
        <div className="parameterTitleInput">
          <TextboxNumeric
            value={String(settings.codeMaxTokens)}
            onInput={onCodeMaxTokensChange}
          />
        </div>
      </div>
      <RangeSlider
        increment={1}
        maximum={getMaximumLength(settings.codeModel)}
        minimum={0}
        value={String(settings.codeMaxTokens)}
        onChange={onCodeMaxTokensChange}
      />

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

      {/* stop sequences */}
      <Text>
        <Muted>Stop sequences</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Textbox variant="border" value={settings.stop} onInput={onStopInput} />

      <VerticalSpace space="medium" />

      {/* reset button */}
      <Button fullWidth secondary onClick={onResetClick}>
        Reset parameters
      </Button>
    </div>
  )
}
