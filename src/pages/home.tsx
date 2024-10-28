import { Check, ChevronsUpDown } from 'lucide-react'
import { ChangeEventHandler, useCallback, useRef, useState } from 'react'
import { StaticAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { Listener } from '@d-fischer/typed-event-emitter'
import { Howl } from 'howler'
import { useDebounceCallback } from 'usehooks-ts'
import ky from 'ky'

import { useToast } from '@/hooks/use-toast'
import { Icons } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAppStore } from '@/store/app'
import { useTwitchStore } from '@/store/twitch'
import { HOST, TWITCH_CLIENT_ID, TWITCH_CLIENT_SCOPE } from '@/constant'
import { cn } from '@/lib/utils'
import { wait } from '@/lib/wait'
import { useGods } from '@/hooks/use-gods'
import { useSkins } from '@/hooks/use-skins'
import { Label } from '@/components/ui/label'

export function Home() {
  const { toast } = useToast()

  const token = useTwitchStore((s) => s.token)
  const channel = useAppStore((s) => s.channel)
  const setChannel = useAppStore((s) => s.setChannel)

  const godId = useAppStore((s) => s.godId)
  const setGodId = useAppStore((s) => s.setGodId)
  const skinId = useAppStore((s) => s.skinId)
  const setSkinId = useAppStore((s) => s.setSkinId)
  const volume = useAppStore((s) => s.volume)
  const setVolume = useAppStore((s) => s.setVolume)

  const [isListening, setIsListening] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [unsubscribe, setUnsubscribe] = useState<Listener | undefined>(
    undefined
  )

  const godsData = useGods()
  const skinsData = useSkins()

  const refChatClient = useRef<ChatClient | undefined>(undefined)

  const registerListener = useCallback(
    (args: { godId: string; skinId: string; volume: number }) => {
      if (refChatClient.current === undefined) {
        return
      }

      if (unsubscribe !== undefined) {
        refChatClient.current.removeListener(unsubscribe)
        setUnsubscribe(undefined)
      }

      const ff = refChatClient.current.onMessage((_channel, _user, text) => {
        if (/^(V[A-Z]{2,})$/.test(text)) {
          ky.get<{ name: string; url: string }>(
            `/api.php?c=vgs&m=sound&id_skin=${args.skinId}&name=${text}`
          )
            .then((a) => a.json())
            .then(({ url }) => {
              new Howl({
                autoplay: true,
                src: [`/${url}`],
                volume: args.volume / 100,
              })
            })
        }
      })
      setUnsubscribe(ff)
    },
    [unsubscribe]
  )

  const listen = useCallback(
    async (args: { channel: string }) => {
      setIsConnecting(true)
      setIsListening(false)

      if (token === null) {
        setIsConnecting(false)
        setIsListening(false)
        throw new Error('Token is required')
      }

      if (refChatClient.current === undefined) {
        const authProvider = new StaticAuthProvider(
          TWITCH_CLIENT_ID,
          token,
          TWITCH_CLIENT_SCOPE
        )
        refChatClient.current = new ChatClient({ authProvider })

        refChatClient.current.connect()
      }

      try {
        await Promise.race([
          refChatClient.current?.join(args.channel),
          wait(10_000),
        ])

        registerListener({ godId, skinId, volume })
        setIsListening(true)
      } catch (error) {
        console.error('Error while joining the channel:', error)
        toast({
          title: 'Error',
          description: 'Failed to join the channel within the time limit',
        })
      } finally {
        setIsConnecting(false)
      }
    },
    [godId, registerListener, skinId, toast, token, volume]
  )

  const handeClickListening = () => {
    listen({ channel }).catch(console.error)
  }

  const refreshChannel = useCallback(
    (newChannel: string, oldChannel: string) => {
      if (newChannel !== oldChannel) {
        if (isListening && refChatClient.current !== undefined) {
          refChatClient.current.part(oldChannel)
          listen({ channel: newChannel }).catch(console.error)
        }
      }
    },
    [isListening, listen]
  )

  const debouncedRefreshChannel = useDebounceCallback(refreshChannel, 500)

  const handleOnChangeChannel: ChangeEventHandler<HTMLInputElement> = (e) => {
    const oldChannel = channel
    const newChannel = e.target.value
    setChannel(newChannel)
    debouncedRefreshChannel(newChannel, oldChannel)
  }

  const refreshVGS = useCallback(
    (newGodId: string, newSkinId: string, newVolume: number) => {
      registerListener({
        godId: newGodId,
        skinId: newSkinId,
        volume: newVolume,
      })
    },
    [registerListener]
  )

  const debouncedRefreshVGS = useDebounceCallback(refreshVGS, 500)

  const handleOnChangeVolume = (value: number[]) => {
    const newVolume = value[0] ?? 0
    setVolume(newVolume)

    debouncedRefreshVGS(godId, skinId, newVolume)
  }

  const handleChangeGod = (newGodId: string): void => {
    setGodId(newGodId)
    const standardSkin = skinsData.data?.find(
      (s) => s.id_god === newGodId && s.name.toLowerCase().includes('standard')
    )
    const newSkinId = standardSkin?.id ?? '1'
    setSkinId(newSkinId)

    debouncedRefreshVGS(newGodId, newSkinId, volume)
  }

  const handleChangeSkin = (skinId: string): void => {
    const newSkinId = skinId ?? '1'
    setSkinId(newSkinId)

    debouncedRefreshVGS(godId, newSkinId, volume)
  }

  return (
    <div className="flex justify-center">
      <div className="flex gap-4 flex-col">
        <div className="flex gap-4 flex-col w-[500px]">
          <div className="flex flex-col w-full gap-4">
            <Label htmlFor="channel">Channel</Label>
            <Input
              className="w-full"
              id="channel"
              placeholder="A twitch channel"
              value={channel}
              onChange={handleOnChangeChannel}
            />
          </div>
          <div className="flex w-full gap-4">
            <div className="flex flex-col w-full gap-4">
              <Label>God</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'justify-between',
                      !godId && 'text-muted-foreground'
                    )}
                  >
                    {godsData.data?.find((i) => i.id === godId)?.name ??
                      'Select God'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command
                    filter={(value, search) => {
                      const current = godsData.data?.find((a) => a.id === value)

                      return current &&
                        current.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                        ? 1
                        : 0
                    }}
                  >
                    <CommandInput placeholder="Search God..." />
                    <CommandList>
                      <CommandEmpty>No God found.</CommandEmpty>
                      <CommandGroup>
                        {godsData.data?.map((g) => (
                          <CommandItem
                            value={g.id}
                            key={g.id}
                            onSelect={handleChangeGod}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                g.id === godId ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {g.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid w-full items-center gap-4">
              <Label>Skin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'justify-between',
                      !skinId && 'text-muted-foreground'
                    )}
                  >
                    {skinsData.data?.find(
                      (i) => i.id === skinId && i.id_god === godId
                    )?.name ?? 'Select a Skin'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command
                    filter={(value, search) => {
                      const current = skinsData.data?.find(
                        (a) => a.id === value
                      )

                      return current &&
                        current.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                        ? 1
                        : 0
                    }}
                  >
                    <CommandInput placeholder="Search a skin..." />
                    <CommandList>
                      <CommandEmpty>No skin found.</CommandEmpty>
                      <CommandGroup>
                        {skinsData.data
                          ?.filter((s) => s.id_god === godId)
                          .map((s) => (
                            <CommandItem
                              value={s.id}
                              key={s.id}
                              onSelect={handleChangeSkin}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  s.id === skinId ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {s.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <Label>Volume</Label>
            <Slider
              max={100}
              min={0}
              step={1}
              disabled={godsData.isLoading || skinsData.isLoading}
              defaultValue={[volume]}
              onValueChange={handleOnChangeVolume}
            />
          </div>
        </div>
        {isListening ? (
          <iframe
            title="twitch-chat"
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=${HOST}`}
            className="flex-grow scroll-auto"
            height={700}
          />
        ) : (
          <div className="flex justify-items-center flex-grow h-[600px]">
            <Button
              onClick={handeClickListening}
              className="flex gap-2"
              disabled={isConnecting}
            >
              Listen VGS
              <Icons.loader
                className={cn('animate-spin', { hidden: !isConnecting })}
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
