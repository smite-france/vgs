import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StoreState = {
  volume: number
  setVolume: (volume: number) => void

  godId: string
  setGodId: (godId: string) => void

  skinId: string
  setSkinId: (skinId: string) => void

  channel: string
  setChannel: (channel: string) => void
}

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      godId: '1',
      setGodId: (godId: string) => set({ godId }),

      skinId: '1',
      setSkinId: (skinId: string) => set({ skinId }),

      channel: 'tilican',
      setChannel: (channel: string) => set({ channel }),

      volume: 80,
      setVolume: (volume: number) => set({ volume }),
    }),
    {
      name: 'app-storage', // Nom de la clé dans localStorage
    }
  )
)
