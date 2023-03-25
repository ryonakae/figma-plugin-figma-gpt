import { useRef } from 'preact/hooks'

import { useUnmount } from 'react-use'

import useSettings from '@/ui/hooks/useSettings'

export default function useTheme() {
  const observerRef = useRef<MutationObserver>()
  const { updateSettings } = useSettings()

  function onHtmlClassNameChange(
    mutations: MutationRecord[],
    observer: MutationObserver
  ) {
    const html = mutations[0].target as HTMLElement
    updateTheme(html)
  }

  function updateTheme(html: HTMLElement) {
    console.log('updateTheme', html.classList)

    if (html.classList.contains('figma-dark')) {
      updateSettings({ theme: 'dark' })
    } else {
      updateSettings({ theme: 'light' })
    }
  }

  function watchTheme() {
    observerRef.current = new MutationObserver(onHtmlClassNameChange)
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  useUnmount(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = undefined
    }
  })

  return { updateTheme, watchTheme }
}
