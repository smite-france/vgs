import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { StaticAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { Listener } from '@d-fischer/typed-event-emitter'
import { Howl } from 'howler'

import { useToast } from '@/hooks/use-toast'
import { Icons } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

const formSchema = z.object({
  channel: z.string().min(2),
  godId: z.string(),
  skinId: z.string(),
  volume: z.number().min(0).max(100),
})

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

  const [isSaving, setIsSaving] = useState<boolean>(false)

  const [isListening, setIsListening] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [unsubscribe, setUnsubscribe] = useState<Listener | undefined>(
    undefined
  )

  const refChatClient = useRef<ChatClient | undefined>(undefined)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel,
      volume,
      godId: '1',
      skinId: '1',
    },
  })

  const registerListener = useCallback(
    (args: { godId: string; skinId: string; volume: number }) => {
      if (refChatClient.current === undefined) {
        return
      }

      if (unsubscribe !== undefined) {
        refChatClient.current.removeListener(unsubscribe)
        setUnsubscribe(undefined)
      }

      setUnsubscribe(
        refChatClient.current.onMessage((_channel, _user, text) => {
          new Howl({
            autoplay: true,
            src: [
              'https://vgs.smitefrance.fr/resources/VGS/vgs_default/male_01/vox_vgs_emote_a.ogg',
            ],
            volume: args.volume / 100,
          })
          console.log({
            text,
            ...args,
          })
        })
      )
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
          wait(2500),
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    setVolume(values.volume)
    setGodId(values.godId)
    setSkinId(values.skinId)
    setChannel(values.channel)

    if (isListening && refChatClient.current !== undefined) {
      if (values.channel !== channel) {
        refChatClient.current.part(channel)
        await listen({
          channel: values.channel,
        })
      } else {
        registerListener({
          godId: values.godId,
          skinId: values.skinId,
          volume: values.volume,
        })
      }
    }

    setIsSaving(false)

    toast({
      title: 'Saved',
    })
  }

  const godsData = useGods()
  const skinsData = useSkins()

  const formGodId = form.watch('godId')

  return (
    <div className="flex justify-center">
      <div className="flex gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow space-y-8"
          >
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <FormControl>
                    <Input placeholder="tilican" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is where you are listening to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="godId"
                render={({ field }) => (
                  <FormItem className="flex-grow flex flex-col">
                    <FormLabel>God</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-[200px] justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {godsData.data?.find((i) => i.id === field.value)
                              ?.name ?? 'Select God'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search God..." />
                          <CommandList>
                            <CommandEmpty>No God found.</CommandEmpty>
                            <CommandGroup>
                              {godsData.data?.map((g) => (
                                <CommandItem
                                  value={g.id}
                                  key={g.id}
                                  onSelect={() => {
                                    form.setValue('godId', g.id)
                                    const standardSkin = skinsData.data?.find(
                                      (s) =>
                                        s.id_god === g.id &&
                                        s.name
                                          .toLowerCase()
                                          .includes('standard')
                                    )
                                    form.setValue('skinId', standardSkin?.id ?? "1")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      g.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skinId"
                render={({ field }) => (
                  <FormItem className="flex-grow flex flex-col">
                    <FormLabel>Skin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-[200px] justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {skinsData.data?.find(
                              (i) =>
                                i.id === field.value && i.id_god === formGodId
                            )?.name ?? 'Select a Skin'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search a skin..." />
                          <CommandList>
                            <CommandEmpty>No skin found.</CommandEmpty>
                            <CommandGroup>
                              {skinsData.data
                                ?.filter((s) => s.id_god === formGodId)
                                .map((s) => (
                                  <CommandItem
                                    value={s.id}
                                    key={s.id}
                                    onSelect={() => {
                                      form.setValue('skinId', s.id)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        s.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="volume"
              render={({ field: { value, onChange } }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Volume</FormLabel>
                  <FormControl>
                    <Slider
                      max={100}
                      min={0}
                      step={1}
                      defaultValue={[value]}
                      onValueChange={(v) => onChange(v[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="flex gap-2" disabled={isSaving}>
              Save
              <Icons.loader
                className={cn('animate-spin', { hidden: !isSaving })}
              />
            </Button>
          </form>
        </Form>
        {isListening ? (
          <iframe
            title="twitch-chat"
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=${HOST}`}
            className="flex-grow h-[600px] min-h-min"
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
