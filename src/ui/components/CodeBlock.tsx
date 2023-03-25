/** @jsx h */
import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

import { Link, Text } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { css } from '@emotion/react'
import { ReactNode } from 'react'
import {
  ElementContent,
  Element,
  Text as TextElement,
} from 'react-markdown/lib/ast-to-react'
// import { Element } from 'react-markdown/lib/rehype-filter'
import { useMount, useCopyToClipboard } from 'react-use'

import { NotifyHandler } from '@/types/eventHandler'

type CodeBlockProps = {
  node: Element
  className?: string
  children: ReactNode | ReactNode[]
}

export default function CodeBlock({
  node,
  className,
  children,
}: CodeBlockProps) {
  const [language, setLanguage] = useState('')
  const [_, copyToClipboard] = useCopyToClipboard()

  function isElement(
    elementContent: ElementContent
  ): elementContent is Element {
    return elementContent.type === 'element'
  }

  function isText(
    elementContent: ElementContent
  ): elementContent is TextElement {
    console.log('isText', elementContent.type)
    return elementContent.type === 'text'
  }

  function getCodeLanguage(elementContent: ElementContent) {
    if (!isElement(elementContent)) {
      return ''
    }
    if (!elementContent.properties) {
      return ''
    }

    const classNames = elementContent.properties.className as string[]
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
    console.log('CodeBlock mounted', node, className, children)
    setLanguage(getCodeLanguage(node.children[0]))
    console.log('getCode', getCode(node.children[0]))
  })

  return (
    <div
      css={css`
        border-radius: var(--border-radius-6);
        overflow: hidden;
      `}
      className={className}
    >
      <div
        css={css`
          padding: 0.5em 1em;
          background-color: var(--figma-color-bg-disabled);
          display: flex;
          align-items: center;
          justify-content: space-between;
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
