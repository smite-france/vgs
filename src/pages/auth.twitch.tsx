import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { TWITCH_AUTH_URL } from '@/constant'

export const AuthTwitch = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p>You are not connect to twitch</p>
      <Link
        to={TWITCH_AUTH_URL}
        className={cn(
          'flex gap-2',
          buttonVariants({ variant: 'default' }),
        )}
      >
        <Icons.twitch className="h-4 w-4" />
        Connect
      </Link>
    </div>
  )
}