export const HOST: string = import.meta.env.VITE_HOST ?? 'HOST'

export const TWITCH_CLIENT_ID: string =
  import.meta.env.VITE_TWITCH_CLIENT_ID ?? 'TWITCH_CLIENT_ID'
export const TWITCH_CLIENT_URL: string =
  import.meta.env.VITE_TWITCH_CLIENT_URL ?? 'TWITCH_CLIENT_URL'
export const TWITCH_CLIENT_SCOPE = ['chat:read', 'chat:edit']

export const TWITCH_AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${TWITCH_CLIENT_URL}&response_type=token&scope=${TWITCH_CLIENT_SCOPE.join('+')}`