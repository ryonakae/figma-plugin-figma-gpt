/** @jsx h */
import { h, JSX } from 'preact'

import {
  Button,
  Link,
  Muted,
  RangeSlider,
  Text,
  Textbox,
  TextboxMultiline,
  TextboxNumeric,
  VerticalSpace,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { TiktokenModel } from 'js-tiktoken'
import { useMount } from 'react-use'

import { ALL_MODELS, DEFAULT_SETTINGS } from '@/constants'
import { NotifyHandler } from '@/types/eventHandler'
import { useStore } from '@/ui/Store'
import useSettings from '@/ui/hooks/useSettings'
import useTikToken from '@/ui/hooks/useTikToken'

export default function Setting() {
  const settings = useStore()
  const { updateSettings, updateMaxTokens } = useSettings()
  const { getTokensFromString } = useTikToken()

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

  function onChatSystemMessageInput(
    event: JSX.TargetedEvent<HTMLTextAreaElement>
  ) {
    const tokens = getTokensFromString(
      event.currentTarget.value,
      settings.chatModel20240724 as TiktokenModel
    )
    updateSettings({
      chatSystemMessage: event.currentTarget.value,
      chatSystemMessageTokens: tokens.length,
    })
  }

  function getMaxTokens(modelName: string) {
    const targetModel = ALL_MODELS.find(model => {
      return model.model === modelName
    })

    if (!targetModel) {
      return 0
    }

    return targetModel.maxTokens
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
    updateMaxTokens({ type: 'chat', model: settings.chatModel20240724 })
    updateMaxTokens({ type: 'code', model: settings.codeModel20240724 })
  })

  return (
    <div
      css={css`
        height: 500px;
        padding: var(--space-medium);
        overflow: auto;
      `}
    >
      {/* api key */}
      <div className="parameterTitle">
        <Text>
          <Muted>OpenAI API key</Muted>
        </Text>
        <Text>
          <Link href="https://platform.openai.com/api-keys" target="_blank">
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
            href="https://platform.openai.com/docs/api-reference/completions/create"
            target="_blank"
          >
            Documentation
          </Link>
        </Text>
      </div>

      <VerticalSpace space="medium" />

      {/* chat system message */}
      <div className="parameterTitle">
        <Text>
          <Muted>Chat system message (Custom Instructions)</Muted>
        </Text>
        <Text>
          <Muted>{settings.chatSystemMessageTokens} tokens</Muted>
        </Text>
      </div>
      <VerticalSpace space="extraSmall" />
      <TextboxMultiline
        grow
        rows={5}
        variant="border"
        value={settings.chatSystemMessage}
        onInput={onChatSystemMessageInput}
      />

      <VerticalSpace space="extraSmall" />

      {/* chat maximum length */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Chat maximum length</Muted>
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
        maximum={getMaxTokens(settings.chatModel20240724)}
        minimum={0}
        value={String(settings.chatMaxTokens)}
        onChange={onChatMaxTokensChange}
      />

      {/* code maximum length */}
      <div className="parameterTitle withRangeSlider">
        <Text>
          <Muted>Code maximum length</Muted>
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
        maximum={getMaxTokens(settings.codeModel20240724)}
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
      <Button fullWidth danger onClick={onResetClick}>
        Reset parameters
      </Button>
    </div>
  )
}
