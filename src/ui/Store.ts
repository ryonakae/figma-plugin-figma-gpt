import { create } from 'zustand'

import { DEFAULT_SETTINGS } from '@/constants'
import { Settings } from '@/types/common'

export const useStore = create<Settings>(set => DEFAULT_SETTINGS)
