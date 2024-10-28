import { Link, Outlet } from 'react-router-dom'

import { Icons } from '@/components/icons'
import { ThemeToggle } from '@/components/theme-toggle'

export const Layout = () => {

  return (
    <div className="w-full lg:min-h-[600px] xl:min-h-[800px]">
      <ThemeToggle className="absolute top-3 right-3" />
      <div className="flex items-center justify-center py-12 gap-2">
        Twitch VGS by
        <Link to="https://www.smitefrance.fr/" target="_blank" className="font-bold text-lg">
          Smite France
        </Link>
      </div>
      <Outlet />
      <div className="flex items-center justify-center py-12 gap-2">
        Made with <Icons.heart style={{ color: 'red' }} /> by
        <Link
          to="https://github.com/smite-france/vgs"
          target="_blank"
          className="flex gap-2"
        >
          <Icons.github />
          Tilican
        </Link>
      </div>
    </div>
  )
}
