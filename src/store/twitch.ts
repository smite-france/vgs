import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StoreState = {
  token: string | null
  setToken: (twitchToken: string) => void
  resetToken: () => void
}

export const useTwitchStore = create<StoreState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token: string) => set({ token }),
      resetToken: () => set({ token: null }),
    }),
    {
      name: 'twitch-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
