/** @jsx h */
import { h, JSX } from 'preact'

import { Link, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { ReactNode } from 'react'
import {
  ElementContent,
  Element,
  Text as TextElement,
} from 'react-markdown/lib/ast-to-react'
import { useMount, useCopyToClipboard, useUnmount } from 'react-use'

import { NotifyHandler } from '@/types/eventHandler'

type CodeBlockProps = {
  node: Element
  children: ReactNode | ReactNode[]
}

function isElement(elementContent: ElementContent): elementContent is Element {
  return elementContent.type === 'element'
}

function isText(elementContent: ElementContent): elementContent is TextElement {
  return elementContent.type === 'text'
}

export default function CodeBlock({ node, children }: CodeBlockProps) {
  const [_, copyToClipboard] = useCopyToClipboard()
  const language = getCodeLanguage(node.children[0])

  function getCodeLanguage(elementContent: ElementContent) {
    if (!isElement(elementContent)) {
      return ''
    }
    if (!elementContent.properties) {
      return ''
    }

    const classNames = elementContent.properties.className as
      | string[]
      | undefined

    if (!classNames) {
      return ''
    }

    const language = classNames.find(className => {
      return className.startsWith('language-')
    })

    if (!language) {
      return ''
    }

    const languageName = language.replace('language-', '')
    return languageName
  }

  function getCode(elementContent: ElementContent) {
    if (!isElement(elementContent)) {
      return ''
    }
    if (!elementContent.properties) {
      return ''
    }

    let code = ''

    elementContent.children.map(child => {
      if (isText(child)) {
        code += child.value
      } else if (isElement(child)) {
        const grandChild = child.children[0] as TextElement | undefined
        if (grandChild && isText(grandChild)) {
          code += grandChild.value
        }
      }
    })

    return code
  }

  function onCopyClick(event: JSX.TargetedEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const code = getCode(node.children[0])
    copyToClipboard(code)
    emit<NotifyHandler>('NOTIFY', {
      message: 'Copied to clipboard.',
    })
  }

  useMount(() => {
    console.log('CodeBlock mounted', node, children)
  })

  useUnmount(() => {
    console.log('CodeBlock unmounted', node, children)
  })

  return (
    <div
      css={css`
        border-radius: var(--border-radius-6);
        overflow: hidden;
      `}
    >
      <div
        css={css`
          padding: 0.5em 1em;
          background-color: var(--figma-color-bg-disabled);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 24px;
        `}
      >
        <span>{language || ''}</span>
        <Text>
          <Link href="#" onClick={onCopyClick}>
            Copy
          </Link>
        </Text>
      </div>
      <div
        css={css`
          background-color: var(--figma-color-bg-tertiary);
        `}
      >
        <pre
          css={css`
            margin: 0;
            padding: 1em;
            overflow-x: auto;

            code,
            code.hljs {
              font-family: 'Menlo, Monaco, "Courier New", monospace';
              display: block;
              padding: 0;
              hyphens: none;
              word-wrap: normal;
              word-break: normal;
              word-spacing: normal;
              background-color: transparent;
            }
          `}
        >
          {children}
        </pre>
      </div>
    </div>
  )
}
