import { create } from 'zustand'

import { DEFAULT_SETTINGS } from '@/constants'
import { Settings } from '@/types'

export const useStore = create<Settings>(set => DEFAULT_SETTINGS)
