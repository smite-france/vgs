import { createBrowserRouter, redirect } from 'react-router-dom'
import ky from 'ky'

import { AuthTwitch } from '@/pages/auth.twitch'
import { AuthTwitchCallback } from '@/pages/auth.twitch.callback'
import { Home } from '@/pages/home'
import { Layout } from '@/pages/layout'
import { useTwitchStore } from '@/store/twitch'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        loader: async () => {
          const token = useTwitchStore.getState().token

          if (token === undefined || token === null) {
            return redirect('/auth/twitch')
          }

          try {
            await ky.get(
              'https://id.twitch.tv/oauth2/validate',
              {
                headers: { Authorization: `OAuth ${token}` },
              }
            )
            return null
          } catch (e) {
            console.error(e)
            useTwitchStore.getState().resetToken()
            return redirect('/auth/twitch')
          }
        },
        path: '',
        element: <Home />,
      },
      {
        loader: async () => {
          const token = useTwitchStore.getState().token

          if (token !== undefined && token !== null) {
            return redirect('/')
          }
          return null
        },
        path: 'auth/twitch',
        element: <AuthTwitch />,
      },
      {
        loader: async () => {
          return null
        },
        path: 'auth/twitch/callback',
        element: <AuthTwitchCallback />,
      },
    ],
  },
])
