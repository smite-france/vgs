import { StaticAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'

import { TWITCH_AUTH_URL, TWITCH_CLIENT_ID, TWITCH_CLIENT_SCOPE } from '@/constant'

class TwitchApiService {
  private _authProvider: StaticAuthProvider | undefined = undefined
  private _twitchChatClient: ChatClient | undefined = undefined

  get chatClient() {
    return this._twitchChatClient
  }

  connect = (accessToken: string) => {
    // // twitch-auth lib do not throw an Error if token is invalide ...
    // // Axios Throw one if unauthorized
    // await axios.get("https://id.twitch.tv/oauth2/validate", {
    //   headers: { Authorization: `OAuth ${accessToken}` },
    // });

    this._authProvider = new StaticAuthProvider(TWITCH_CLIENT_ID, accessToken, TWITCH_CLIENT_SCOPE)

    this._twitchChatClient = new ChatClient({ authProvider: this._authProvider })
    this._twitchChatClient.connect()
  }

  oauth = () => {
    window.open(TWITCH_AUTH_URL, '_self')
  }
}

// singleton
export const twitchApiManager = new TwitchApiService()