import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StoreState = {
  volume: number
  setVolume: (volume: number) => void

  god: string
  setGod: (god: string) => void

  skin: string
  setSkin: (skin: string) => void

  channel: string
  setChannel: (channel: string) => void
}

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      god: 'Default',
      setGod: (god: string) => set({ god }),

      skin: 'Default',
      setSkin: (skin: string) => set({ skin }),

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
